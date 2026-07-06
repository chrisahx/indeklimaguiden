from __future__ import annotations

import re
from urllib.parse import unquote

from playwright.async_api import Page, TimeoutError as PlaywrightTimeoutError

from .utils import clean_text


async def extract_name(page: Page) -> str:
    return await first_text(page, ["h1"])


async def extract_category(page: Page) -> str:
    return await first_text(page, ["button[jsaction*='category']", "button[aria-label*='Kategori']", "div[role='main'] button"])


async def extract_phone(page: Page) -> str:
    return await first_text(page, ["button[data-item-id^='phone']", "button[aria-label*='Telefon']", "button[aria-label*='Phone']"])


async def extract_website(page: Page) -> str:
    href = await first_attr(page, ["a[data-item-id='authority']", "a[aria-label*='Website']", "a[aria-label*='Websted']"], "href")
    return href


async def extract_address(page: Page) -> str:
    return await first_text(page, ["button[data-item-id='address']", "button[aria-label*='Adresse']", "button[aria-label*='Address']"])


async def extract_description(page: Page) -> str:
    return await first_text(page, ["div[jsaction*='pane.description']", "div[role='main'] div[aria-label]"])


async def extract_opening_hours(page: Page) -> list[str]:
    rows: list[str] = []
    candidates = page.locator("table tr, div[aria-label*='Åbningstider'], div[aria-label*='Hours']")
    for index in range(min(await candidates.count(), 20)):
        text = clean_text(await safe_text(candidates.nth(index)))
        if text and text not in rows:
            rows.append(text)
    return rows


async def extract_rating(page: Page) -> tuple[str, int | None]:
    text = await first_text(page, ["div[role='main']", "body"])
    rating_match = re.search(r"\b(\d(?:[,.]\d)?)\b", text)
    review_match = re.search(r"([\d.,]+)\s*(?:anmeldelser|reviews)", text, re.I)
    rating = rating_match.group(1).replace(",", ".") if rating_match else ""
    review_count = int(re.sub(r"[^0-9]", "", review_match.group(1))) if review_match else None
    return rating, review_count


def extract_coordinates_from_url(url: str) -> tuple[str, str]:
    decoded = unquote(url or "")
    patterns = [
        r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)",
        r"@(-?\d+\.\d+),(-?\d+\.\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, decoded)
        if match:
            return match.group(1), match.group(2)
    return "", ""


async def first_text(page: Page, selectors: list[str]) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if await locator.count() > 0:
                text = clean_text(await locator.inner_text(timeout=1_500))
                if text:
                    return text
        except PlaywrightTimeoutError:
            continue
    return ""


async def first_attr(page: Page, selectors: list[str], attr: str) -> str:
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            if await locator.count() > 0:
                value = clean_text(await locator.get_attribute(attr, timeout=1_500))
                if value:
                    return value
        except PlaywrightTimeoutError:
            continue
    return ""


async def safe_text(locator) -> str:
    try:
        return await locator.inner_text(timeout=1_000)
    except PlaywrightTimeoutError:
        return ""
