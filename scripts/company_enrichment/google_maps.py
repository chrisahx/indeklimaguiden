from __future__ import annotations

import asyncio
import hashlib
import logging
import re

from playwright.async_api import Locator, Page, TimeoutError as PlaywrightTimeoutError

from scripts.google_maps_scraper.config import ScraperConfig
from scripts.google_maps_scraper.parser import (
    extract_address,
    extract_category,
    extract_coordinates_from_url,
    extract_description,
    extract_name,
    extract_opening_hours,
    extract_phone,
    extract_rating,
    extract_website,
)
from scripts.google_maps_scraper.scraper import GoogleMapsScraper
from scripts.google_maps_scraper.utils import clean_text, maps_search_url, random_delay, utc_now_iso

from .contact import extract_contact_details, split_name_and_cvr
from .matching import normalize_domain, score_google_match
from .models import InputCompany


LOGGER = logging.getLogger(__name__)


async def scrape_google_company(
    company: InputCompany,
    config: ScraperConfig,
    max_reviews: int,
    candidate_limit: int = 2,
) -> tuple[dict[str, object], list[dict[str, object]], dict[str, object]]:
    async with GoogleMapsScraper(config) as scraper:
        candidates: list[dict[str, object]] = []
        best: dict[str, object] | None = None
        for query in build_company_queries(company):
            if not scraper.context:
                raise RuntimeError("Google Maps scraper context is not initialized")
            page = await scraper.context.new_page()
            try:
                urls = await collect_company_candidate_urls(scraper, page, query, candidate_limit)
            finally:
                await page.close()

            for url in urls[:candidate_limit]:
                await asyncio.sleep(random_delay(config.delay_min, config.delay_max))
                profile = await scrape_google_profile(scraper, url, company, include_reviews=False, max_reviews=0)
                profile["match_score"] = score_google_match(company.to_dict(), profile)
                candidates.append(profile)
                if int(profile.get("match_score", 0)) >= 50:
                    best = profile
                    break

            if best:
                break

        if not candidates:
            return google_error("not_found", "No Google Maps candidates found"), [], {"candidates": []}

        best = best or max(candidates, key=lambda candidate: int(candidate.get("match_score", 0)))
        if int(best.get("match_score", 0)) < 20:
            best["status"] = "needs_manual_review"

        profile = await scrape_google_profile(scraper, str(best["maps_url"]), company, include_reviews=True, max_reviews=max_reviews)
        profile["match_score"] = best.get("match_score", 0)
        profile["status"] = best.get("status", profile.get("status", "ok"))
        reviews = profile.pop("reviews", [])
        raw = {"candidates": candidates, "selected": profile, "reviews": reviews}
        return profile, list(reviews), raw


def build_company_queries(company: InputCompany) -> list[str]:
    queries = []
    simple_name = simplify_company_name(company.name)
    short_address = simplify_address(company.address)

    if company.address:
        queries.append(company.address)
    if short_address and short_address != company.address:
        queries.append(short_address)
    if simple_name:
        queries.append(simple_name)
    if company.name and company.name != simple_name:
        queries.append(company.name)
    if company.address:
        queries.append(" ".join(part for part in (simple_name or company.name, short_address or company.address) if part))
        queries.append(" ".join(part for part in (company.name, company.address) if part))
    base = " ".join(part for part in (simple_name or company.name, company.city, "varmepumpe") if part)
    if base:
        queries.append(base)
    domain = normalize_domain(company.website)
    if domain:
        queries.append(" ".join(part for part in (simple_name or company.name, domain) if part))
    return list(dict.fromkeys(queries or [company.name]))


async def collect_company_candidate_urls(
    scraper: GoogleMapsScraper,
    page: Page,
    query: str,
    candidate_limit: int,
) -> list[str]:
    urls = await scraper.collect_listing_urls(page, query, candidate_limit)
    if urls:
        return urls

    # Google Maps can visually open a place profile without exposing result links.
    # In that case the current page itself is the candidate we need to scrape.
    await page.wait_for_timeout(2_000)
    if await looks_like_place_profile(page):
        return [page.url]

    await page.goto(maps_search_url(query, scraper.config.language), wait_until="networkidle", timeout=scraper.config.navigation_timeout_ms)
    await scraper.accept_cookies(page)
    await page.wait_for_timeout(2_000)
    if await looks_like_place_profile(page):
        return [page.url]

    return await scraper.visible_listing_urls(page)


async def looks_like_place_profile(page: Page) -> bool:
    try:
        if await page.locator("h1").count() == 0:
            return False
        profile_markers = page.locator(
            "button[data-item-id='address'], "
            "button[data-item-id^='phone'], "
            "a[data-item-id='authority'], "
            "button[aria-label*='reviews'], "
            "button[aria-label*='anmeldelser']"
        )
        return await profile_markers.count() > 0 or "/maps/place/" in page.url
    except PlaywrightTimeoutError:
        return False


def simplify_company_name(name: str) -> str:
    value = clean_text(name)
    value = re.sub(r"\b(A/S|AS|ApS|I/S|IVS)\b", "", value, flags=re.I)
    value = re.sub(r"\s+", " ", value).strip(" ,-.")
    return value


def simplify_address(address: str) -> str:
    value = clean_text(address)
    return value.split(",", 1)[0].strip() if "," in value else value


async def scrape_google_profile(
    scraper: GoogleMapsScraper,
    url: str,
    company: InputCompany,
    include_reviews: bool,
    max_reviews: int,
) -> dict[str, object]:
    if not scraper.context:
        raise RuntimeError("Google Maps scraper context is not initialized")
    page = await scraper.context.new_page()
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=scraper.config.navigation_timeout_ms)
        await scraper.detect_blocking(page)
        await page.wait_for_selector("h1", timeout=scraper.config.navigation_timeout_ms)
        await page.wait_for_timeout(1_000)

        rating, review_count = await extract_rating(page)
        latitude, longitude = extract_coordinates_from_url(page.url)
        raw_name = await extract_name(page)
        name, cvr = split_name_and_cvr(raw_name, company.cvr)
        phone = await extract_phone(page)
        body_text = await page.locator("body").inner_text(timeout=3_000)
        contact = extract_contact_details(body_text)
        if phone:
            contact.setdefault("phone", phone)
            phones = contact.setdefault("phones", [])
            if isinstance(phones, list) and phone not in phones:
                phones.insert(0, phone)

        data: dict[str, object] = {
            "status": "ok",
            "name": name,
            "category": await extract_category(page),
            "phone": contact.get("phone", phone),
            "email": contact.get("email", ""),
            "website": await extract_website(page),
            "address": await extract_address(page),
            "rating": rating,
            "review_count": review_count,
            "opening_hours": await extract_opening_hours(page),
            "description": await extract_description(page),
            "maps_url": page.url,
            "latitude": latitude,
            "longitude": longitude,
            "photos": await extract_photos(page),
            "contact": contact,
            "last_scraped_at": utc_now_iso(),
        }
        if cvr:
            data["cvr"] = cvr
        if include_reviews:
            data["reviews"] = await extract_google_reviews(page, company.id, max_reviews)
        return data
    except Exception as error:
        LOGGER.warning("Failed to scrape Google Maps profile %s: %s", url, error)
        return google_error(f"error:{type(error).__name__}", str(error), url)
    finally:
        await page.close()


async def extract_photos(page: Page, limit: int = 20) -> list[dict[str, str]]:
    photos: list[dict[str, str]] = []
    seen: set[str] = set()
    images = page.locator("img[src*='googleusercontent'], img[src*='gstatic']")
    for index in range(min(await images.count(), limit * 3)):
        src = await images.nth(index).get_attribute("src")
        if src and src not in seen and not src.startswith("data:"):
            seen.add(src)
            photos.append({"url": src, "source": "google"})
        if len(photos) >= limit:
            break
    return photos


async def extract_google_reviews(page: Page, company_id: str, max_reviews: int) -> list[dict[str, object]]:
    review_button = page.locator("button[aria-label*='reviews'], button[aria-label*='anmeldelser']").first
    try:
        if await review_button.count() == 0:
            return []
        await review_button.click(timeout=5_000)
        await page.wait_for_timeout(2_000)
    except PlaywrightTimeoutError:
        return []

    await expand_more_buttons(page)
    reviews: dict[str, dict[str, object]] = {}
    stale_scrolls = 0
    scroll_limit = 1_000 if max_reviews == 0 else max(20, max_reviews // 5 + 20)
    target_count = max_reviews if max_reviews > 0 else None

    for _ in range(scroll_limit):
        before = len(reviews)
        for row in await parse_visible_google_reviews(page, company_id):
            reviews[str(row["review_id"])] = row
            if target_count and len(reviews) >= target_count:
                return list(reviews.values())[:target_count]

        if len(reviews) == before:
            stale_scrolls += 1
        else:
            stale_scrolls = 0
        if stale_scrolls >= 8:
            break

        await scroll_review_panel(page)
        await page.wait_for_timeout(1_000)
        await expand_more_buttons(page)

    return list(reviews.values())


async def parse_visible_google_reviews(page: Page, company_id: str) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    cards = page.locator("div[data-review-id], div[jscontroller][aria-label][data-hveid]")
    for index in range(await cards.count()):
        card = cards.nth(index)
        text = await text_from_first([
            card.locator("span[jscontroller] span").filter(has_text=re.compile(r".+")),
            card.locator("span").filter(has_text=re.compile(r".{20,}")),
        ])
        author = await text_from_first([
            card.locator("div[class] button, div[class] a").first,
            card.locator("div").first,
        ])
        rating_label = await attr_from_first([card.locator("span[aria-label*='star'], span[aria-label*='stjerne']")], "aria-label")
        date = await text_from_first([card.locator("span").filter(has_text=re.compile(r"ago|siden|\d{4}|jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec", re.I))])
        if not text and not rating_label:
            continue
        fingerprint = hashlib.sha1(f"{company_id}|{author}|{date}|{rating_label}|{text}".encode("utf-8")).hexdigest()[:16]
        rows.append({
            "company_id": company_id,
            "source": "google",
            "review_id": f"google:{company_id}:{fingerprint}",
            "author": clean_text(author),
            "rating": extract_rating_number(rating_label),
            "rating_label": clean_text(rating_label),
            "date": clean_text(date),
            "text": clean_text(text),
            "scraped_at": utc_now_iso(),
        })
    return rows


async def expand_more_buttons(page: Page) -> None:
    buttons = page.get_by_role("button", name=re.compile(r"^(More|Mere)$", re.I))
    for index in range(min(await buttons.count(), 20)):
        try:
            await buttons.nth(index).click(timeout=500)
        except PlaywrightTimeoutError:
            continue


async def scroll_review_panel(page: Page) -> None:
    panels = [page.locator("div[role='main']"), page.locator("div[role='dialog']"), page.locator("div[tabindex='-1']")]
    for panel in panels:
        try:
            if await panel.count() > 0:
                await panel.first.evaluate("element => element.scrollBy(0, element.scrollHeight)")
                return
        except PlaywrightTimeoutError:
            continue
    await page.mouse.wheel(0, 2500)


async def text_from_first(locators: list[Locator]) -> str:
    for locator in locators:
        try:
            if await locator.count() > 0:
                return clean_text(await locator.first.text_content(timeout=700))
        except PlaywrightTimeoutError:
            continue
    return ""


async def attr_from_first(locators: list[Locator], attr: str) -> str:
    for locator in locators:
        try:
            if await locator.count() > 0:
                return clean_text(await locator.first.get_attribute(attr, timeout=700))
        except PlaywrightTimeoutError:
            continue
    return ""


def extract_rating_number(value: str) -> str:
    match = re.search(r"\d+(?:[,.]\d+)?", value or "")
    return match.group(0).replace(",", ".") if match else ""


def google_error(status: str, message: str, url: str = "") -> dict[str, object]:
    return {"status": status, "error": message, "maps_url": url, "last_scraped_at": utc_now_iso()}
