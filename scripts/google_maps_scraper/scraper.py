from __future__ import annotations

import logging
import re

from playwright.async_api import Browser, BrowserContext, Page, TimeoutError as PlaywrightTimeoutError, async_playwright

from .config import ScraperConfig
from .utils import maps_search_url


LOGGER = logging.getLogger(__name__)


class GoogleMapsScraper:
    def __init__(self, config: ScraperConfig) -> None:
        self.config = config
        self.playwright = None
        self.browser: Browser | None = None
        self.context: BrowserContext | None = None

    async def __aenter__(self) -> GoogleMapsScraper:
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=self.config.headless)
        self.context = await self.browser.new_context(
            locale="da-DK" if self.config.language == "da" else self.config.language,
            user_agent=self.config.user_agent,
            viewport={"width": 1440, "height": 1100},
        )
        self.context.set_default_timeout(self.config.action_timeout_ms)
        return self

    async def __aexit__(self, exc_type, exc, traceback) -> None:
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def collect_listing_urls(self, page: Page, query: str, candidate_limit: int) -> list[str]:
        await page.goto(maps_search_url(query, self.config.language), wait_until="domcontentloaded", timeout=self.config.navigation_timeout_ms)
        await self.accept_cookies(page)
        await self.detect_blocking(page)
        await page.wait_for_timeout(2_000)
        return (await self.visible_listing_urls(page))[:candidate_limit]

    async def visible_listing_urls(self, page: Page) -> list[str]:
        urls: list[str] = []
        seen: set[str] = set()
        links = page.locator("a[href*='/maps/place/'], a[href*='google.com/maps/place']")
        for index in range(min(await links.count(), 80)):
            try:
                href = await links.nth(index).get_attribute("href", timeout=700)
            except PlaywrightTimeoutError:
                continue
            if href and href not in seen:
                seen.add(href)
                urls.append(href)
        return urls

    async def accept_cookies(self, page: Page) -> None:
        for name in ("Accept all", "Acceptér alle", "Accepter alle", "I agree", "Reject all", "Afvis alle"):
            try:
                button = page.get_by_role("button", name=name)
                if await button.count() > 0:
                    await button.first.click(timeout=2_000)
                    await page.wait_for_timeout(500)
                    return
            except PlaywrightTimeoutError:
                continue

    async def detect_blocking(self, page: Page) -> None:
        try:
            text = (await page.locator("body").inner_text(timeout=3_000)).lower()
        except PlaywrightTimeoutError:
            return
        markers = ("unusual traffic", "sorry", "captcha", "verify", "our systems have detected")
        if any(re.search(marker, text) for marker in markers):
            LOGGER.warning("Possible Google blocking page detected at %s", page.url)
            raise RuntimeError("Google blocking or captcha page detected")
