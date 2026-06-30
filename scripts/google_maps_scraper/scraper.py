from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncIterator

from playwright.async_api import Browser, BrowserContext, Page, TimeoutError as PlaywrightTimeoutError, async_playwright

from .config import ScraperConfig
from .models import BusinessResult
from .parser import (
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
from .utils import maps_search_url, random_delay, utc_now_iso


LOGGER = logging.getLogger(__name__)


class GoogleMapsScraper:
    def __init__(self, config: ScraperConfig) -> None:
        self.config = config
        self.browser: Browser | None = None
        self.context: BrowserContext | None = None

    async def __aenter__(self) -> GoogleMapsScraper:
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=self.config.headless)
        self.context = await self.browser.new_context(
            locale=self.config.language,
            user_agent=self.config.user_agent,
            viewport={"width": 1440, "height": 1100},
        )
        self.context.set_default_timeout(self.config.action_timeout_ms)
        return self

    async def __aexit__(self, *_: object) -> None:
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        await self.playwright.stop()

    async def scrape_query(
        self,
        query: str,
        city: str,
        country: str,
        max_per_query: int | None,
    ) -> AsyncIterator[BusinessResult]:
        if not self.context:
            raise RuntimeError("Scraper context is not initialized")

        page = await self.context.new_page()
        try:
            urls = await self.collect_listing_urls(page, query, max_per_query)
        finally:
            await page.close()

        LOGGER.info("Collected %s candidate URLs for query %r", len(urls), query)

        for index, url in enumerate(urls, start=1):
            await asyncio.sleep(random_delay(self.config.delay_min, self.config.delay_max))
            LOGGER.info("Scraping %s/%s: %s", index, len(urls), url)
            result = await self.scrape_business(url, query, city, country)
            yield result

    async def collect_listing_urls(self, page: Page, query: str, max_per_query: int | None) -> list[str]:
        await page.goto(maps_search_url(query, self.config.language), wait_until="domcontentloaded", timeout=self.config.navigation_timeout_ms)
        await self.accept_cookies(page)
        await self.detect_blocking(page)
        await page.wait_for_timeout(2_000)

        if "/maps/place/" in page.url:
            return [page.url]

        urls: list[str] = []
        seen: set[str] = set()
        stale_scrolls = 0

        for _ in range(self.config.max_scroll_attempts):
            await self.detect_blocking(page)
            previous_count = len(seen)

            for url in await self.visible_listing_urls(page):
                if url not in seen:
                    seen.add(url)
                    urls.append(url)
                    if max_per_query and len(urls) >= max_per_query:
                        return urls

            if len(seen) == previous_count:
                stale_scrolls += 1
            else:
                stale_scrolls = 0

            if stale_scrolls >= self.config.max_stale_scrolls:
                break

            await self.scroll_results(page)
            await page.wait_for_timeout(self.config.scroll_pause_ms)

        return urls

    async def visible_listing_urls(self, page: Page) -> list[str]:
        urls: list[str] = []
        links = page.locator("a[href*='/maps/place/']")
        count = await links.count()
        for index in range(count):
            href = await links.nth(index).get_attribute("href")
            if href and "/maps/place/" in href:
                urls.append(href)
        return urls

    async def scroll_results(self, page: Page) -> None:
        feed = page.locator("div[role='feed']")
        try:
            if await feed.count() > 0:
                await feed.first.evaluate("element => element.scrollBy(0, element.scrollHeight)")
                return
        except PlaywrightTimeoutError:
            pass
        await page.mouse.wheel(0, 3500)

    async def scrape_business(self, url: str, query: str, city: str, country: str) -> BusinessResult:
        if not self.context:
            raise RuntimeError("Scraper context is not initialized")

        page = await self.context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=self.config.navigation_timeout_ms)
            await self.detect_blocking(page)
            await page.wait_for_selector("h1", timeout=self.config.navigation_timeout_ms)
            await page.wait_for_timeout(1_000)

            rating, review_count = await extract_rating(page)
            current_url = page.url
            latitude, longitude = extract_coordinates_from_url(current_url)

            return BusinessResult(
                name=await extract_name(page),
                category=await extract_category(page),
                phone=await extract_phone(page),
                website=await extract_website(page),
                address=await extract_address(page),
                city=city,
                country=country,
                rating=rating,
                review_count=review_count,
                opening_hours=await extract_opening_hours(page),
                description=await extract_description(page),
                google_maps_url=current_url,
                latitude=latitude,
                longitude=longitude,
                source_query=query,
                scraped_at=utc_now_iso(),
                status="ok",
            )
        except Exception as error:  # Keep scraping subsequent businesses after per-listing failures.
            LOGGER.warning("Failed to scrape %s: %s", url, error)
            return BusinessResult(
                google_maps_url=url,
                city=city,
                country=country,
                source_query=query,
                scraped_at=utc_now_iso(),
                status=f"error: {type(error).__name__}",
            )
        finally:
            await page.close()

    async def accept_cookies(self, page: Page) -> None:
        buttons = [
            page.get_by_role("button", name="Accept all"),
            page.get_by_role("button", name="Reject all"),
            page.get_by_role("button", name="Accepter alle"),
            page.get_by_role("button", name="Afvis alle"),
        ]
        for button in buttons:
            try:
                if await button.count() > 0:
                    await button.first.click(timeout=2_000)
                    await page.wait_for_timeout(1_000)
                    return
            except PlaywrightTimeoutError:
                continue

    async def detect_blocking(self, page: Page) -> None:
        text = (await page.locator("body").inner_text(timeout=5_000)).lower()
        blocking_markers = (
            "unusual traffic",
            "our systems have detected",
            "captcha",
            "sorry",
        )
        if any(marker in text for marker in blocking_markers):
            raise RuntimeError("Google blocking or captcha page detected")
