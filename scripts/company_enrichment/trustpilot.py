from __future__ import annotations

import hashlib
import logging
import re

from playwright.async_api import Browser, BrowserContext, Page, TimeoutError as PlaywrightTimeoutError, async_playwright

from scripts.google_maps_scraper.config import ScraperConfig
from scripts.google_maps_scraper.utils import clean_text, utc_now_iso

from .matching import normalize_domain
from .models import InputCompany


LOGGER = logging.getLogger(__name__)


async def scrape_trustpilot_company(
    company: InputCompany,
    website: str,
    config: ScraperConfig,
    max_reviews: int,
) -> tuple[dict[str, object], list[dict[str, object]], dict[str, object]]:
    domain = normalize_domain(website or company.website)
    if not domain:
        LOGGER.info("Skipping Trustpilot for %s: no website/domain available", company.id)
        return trustpilot_error("not_checked_no_website", "No website/domain available"), [], {}

    profile_url = f"https://dk.trustpilot.com/review/{domain}"
    LOGGER.info("Opening Trustpilot profile for %s: %s", company.id, profile_url)
    playwright = await async_playwright().start()
    browser: Browser | None = None
    context: BrowserContext | None = None
    try:
        browser = await playwright.chromium.launch(headless=config.headless)
        context = await browser.new_context(locale="da-DK", user_agent=config.user_agent, viewport={"width": 1440, "height": 1100})
        context.set_default_timeout(config.action_timeout_ms)
        page = await context.new_page()
        await page.goto(profile_url, wait_until="domcontentloaded", timeout=config.navigation_timeout_ms)
        await accept_trustpilot_cookies(page)
        if not await wait_for_trustpilot_ready(page):
            return trustpilot_error("blocked", "Trustpilot browser verification or anti-bot page detected", profile_url), [], {"profile_url": profile_url}
        if await is_not_found(page):
            return trustpilot_error("not_found", f"No Trustpilot profile found for {domain}", profile_url), [], {"profile_url": profile_url}

        data = await parse_trustpilot_profile(page, domain, profile_url)
        reviews = await extract_trustpilot_reviews(page, company.id, profile_url, max_reviews)
        raw = {"profile": data, "reviews": reviews}
        return data, reviews, raw
    except Exception as error:
        LOGGER.warning("Failed to scrape Trustpilot %s: %s", profile_url, error)
        return trustpilot_error(f"error:{type(error).__name__}", str(error), profile_url), [], {"profile_url": profile_url}
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        await playwright.stop()


async def parse_trustpilot_profile(page: Page, domain: str, profile_url: str) -> dict[str, object]:
    rating = await first_text(page, [
        "p[data-rating-typography]",
        "span[data-rating-typography]",
        "[class*='trustscore']",
        "body",
    ])
    rating_value = extract_first_decimal(rating)
    review_count_text = await first_text(page, ["span:has-text('anmeldelser')", "span:has-text('reviews')", "body"])
    page_text = clean_text(await page.locator("body").inner_text(timeout=3_000))
    claimed_domain = normalize_domain(await first_attr(page, ["a[href^='http']"], "href"))
    return {
        "status": "ok",
        "profile_url": profile_url,
        "domain": domain,
        "claimed_domain": claimed_domain,
        "verified_by_domain": not claimed_domain or claimed_domain == domain,
        "rating": rating_value,
        "rating_text": clean_text(rating[:200]),
        "review_count": extract_review_count(review_count_text or page_text),
        "last_scraped_at": utc_now_iso(),
    }


async def extract_trustpilot_reviews(page: Page, company_id: str, profile_url: str, max_reviews: int) -> list[dict[str, object]]:
    reviews: dict[str, dict[str, object]] = {}
    page_number = 1
    while True:
        for row in await parse_visible_trustpilot_reviews(page, company_id, profile_url):
            reviews[str(row["review_id"])] = row
            if max_reviews > 0 and len(reviews) >= max_reviews:
                return list(reviews.values())[:max_reviews]

        next_link = page.locator("a[rel='next'], a[aria-label*='Next'], a[aria-label*='Næste']").first
        if await next_link.count() == 0:
            break
        try:
            await next_link.click(timeout=5_000)
            await page.wait_for_load_state("domcontentloaded", timeout=15_000)
            await page.wait_for_timeout(1_000)
            page_number += 1
            if max_reviews == 0 and page_number > 500:
                break
        except PlaywrightTimeoutError:
            break
    return list(reviews.values())


async def parse_visible_trustpilot_reviews(page: Page, company_id: str, profile_url: str) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    cards = page.locator("article, div[data-service-review-card-paper]")
    for index in range(await cards.count()):
        card = cards.nth(index)
        text = clean_text(await safe_inner_text(card))
        if len(text) < 20:
            continue
        rating_label = await safe_attr(card.locator("img[alt*='Rated'], img[alt*='Bedømt']").first, "alt")
        date = await safe_attr(card.locator("time").first, "datetime") or clean_text(await safe_inner_text(card.locator("time").first))
        title = clean_text(await safe_inner_text(card.locator("h2, h3").first))
        author = clean_text(await safe_inner_text(card.locator("aside span, [data-consumer-name-typography]").first))
        fingerprint = hashlib.sha1(f"{company_id}|{author}|{date}|{rating_label}|{title}|{text}".encode("utf-8")).hexdigest()[:16]
        rows.append({
            "company_id": company_id,
            "source": "trustpilot",
            "review_id": f"trustpilot:{company_id}:{fingerprint}",
            "profile_url": profile_url,
            "author": author,
            "rating": extract_first_decimal(rating_label),
            "rating_label": clean_text(rating_label),
            "date": date,
            "title": title,
            "text": text,
            "scraped_at": utc_now_iso(),
        })
    return rows


async def accept_trustpilot_cookies(page: Page) -> None:
    for name in ("Accept all", "Acceptér alle", "Accepter alle", "Allow all"):
        try:
            button = page.get_by_role("button", name=name)
            if await button.count() > 0:
                await button.first.click(timeout=2_000)
                return
        except PlaywrightTimeoutError:
            continue


async def wait_for_trustpilot_ready(page: Page, attempts: int = 10) -> bool:
    for _ in range(attempts):
        text = (await page.locator("body").inner_text(timeout=5_000)).lower()
        if not is_trustpilot_verification_text(text):
            return True
        await page.wait_for_timeout(1_500)
    return False


def is_trustpilot_verification_text(text: str) -> bool:
    markers = (
        "verifying your connection",
        "verify your browser",
        "please wait while we verify",
        "checking your browser",
        "cloudflare",
    )
    return any(marker in text for marker in markers)


async def is_not_found(page: Page) -> bool:
    text = (await page.locator("body").inner_text(timeout=5_000)).lower()
    return page.url.endswith("/404") or "denne side findes ikke" in text or "page not found" in text


async def first_text(page: Page, selectors: list[str]) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if await locator.count() > 0:
                text = await locator.inner_text(timeout=1_000)
                if clean_text(text):
                    return clean_text(text)
        except PlaywrightTimeoutError:
            continue
    return ""


async def first_attr(page: Page, selectors: list[str], attr: str) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if await locator.count() > 0:
                value = await locator.get_attribute(attr, timeout=1_000)
                if clean_text(value):
                    return clean_text(value)
        except PlaywrightTimeoutError:
            continue
    return ""


async def safe_inner_text(locator) -> str:
    try:
        if await locator.count() > 0:
            return await locator.inner_text(timeout=1_000)
    except PlaywrightTimeoutError:
        return ""
    return ""


async def safe_attr(locator, attr: str) -> str:
    try:
        if await locator.count() > 0:
            return await locator.get_attribute(attr, timeout=1_000) or ""
    except PlaywrightTimeoutError:
        return ""
    return ""


def extract_first_decimal(value: str) -> str:
    match = re.search(r"\d+(?:[,.]\d+)?", value or "")
    return match.group(0).replace(",", ".") if match else ""


def extract_review_count(value: str) -> str:
    match = re.search(r"([\d.,]+)\s*(?:anmeldelser|reviews)", value or "", re.I)
    return match.group(1) if match else ""


def trustpilot_error(status: str, message: str, profile_url: str = "") -> dict[str, object]:
    return {"status": status, "error": message, "profile_url": profile_url, "last_scraped_at": utc_now_iso()}
