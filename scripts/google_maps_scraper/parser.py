from __future__ import annotations

import re

from playwright.async_api import Locator, Page, TimeoutError as PlaywrightTimeoutError

from .utils import clean_label, clean_text, extract_number, parse_coordinates


async def first_text(locators: list[Locator], timeout_ms: int = 1_000) -> str:
    for locator in locators:
        try:
            if await locator.count() > 0:
                text = await locator.first.text_content(timeout=timeout_ms)
                text = clean_text(text)
                if text:
                    return text
        except PlaywrightTimeoutError:
            continue
    return ""


async def first_attribute(locators: list[Locator], attribute: str, timeout_ms: int = 1_000) -> str:
    for locator in locators:
        try:
            if await locator.count() > 0:
                value = await locator.first.get_attribute(attribute, timeout=timeout_ms)
                value = clean_text(value)
                if value:
                    return value
        except PlaywrightTimeoutError:
            continue
    return ""


async def extract_name(page: Page) -> str:
    return await first_text([
        page.locator("h1"),
        page.locator("[role='main'] h1"),
    ])


async def extract_category(page: Page) -> str:
    aria = await first_attribute([
        page.locator("button[jsaction*='category']"),
        page.locator("button[aria-label*='Category']"),
    ], "aria-label")
    if aria:
        return clean_label(aria, ("Category",))

    return await first_text([
        page.locator("button[jsaction*='category']"),
        page.locator("[role='main'] button").filter(has_text=re.compile(r"^[A-Za-z].*")),
    ])


async def extract_rating(page: Page) -> tuple[str, str]:
    rating_text = await first_text([
        page.locator("span[aria-hidden='true']").filter(has_text=re.compile(r"^\d+[.,]?\d*$")),
        page.locator("[role='main'] span").filter(has_text=re.compile(r"^\d+[.,]?\d*$")),
    ])

    review_label = await first_attribute([
        page.locator("button[aria-label*='reviews']"),
        page.locator("button[aria-label*='anmeldelser']"),
    ], "aria-label")
    review_count = extract_number(review_label)
    return rating_text, review_count


async def extract_address(page: Page) -> str:
    label = await first_attribute([
        page.locator("button[data-item-id='address']"),
        page.locator("button[aria-label^='Address']"),
        page.locator("button[aria-label^='Adresse']"),
    ], "aria-label")
    return clean_label(label, ("Address", "Adresse"))


async def extract_phone(page: Page) -> str:
    label = await first_attribute([
        page.locator("button[data-item-id^='phone']"),
        page.locator("button[aria-label^='Phone']"),
        page.locator("button[aria-label^='Telefon']"),
    ], "aria-label")
    return clean_label(label, ("Phone", "Telefon"))


async def extract_website(page: Page) -> str:
    href = await first_attribute([
        page.locator("a[data-item-id='authority']"),
        page.locator("a[aria-label^='Website']"),
        page.locator("a[aria-label^='Websted']"),
    ], "href")
    return href


async def extract_opening_hours(page: Page) -> str:
    label = await first_attribute([
        page.locator("div[aria-label*='hours']"),
        page.locator("div[aria-label*='Hours']"),
        page.locator("div[aria-label*='åbningstider']"),
        page.locator("div[aria-label*='Åbningstider']"),
    ], "aria-label")
    if label:
        return clean_text(label)

    return await first_text([
        page.locator("table").filter(has_text=re.compile(r"Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|mandag|tirsdag", re.I)),
    ])


async def extract_description(page: Page) -> str:
    return await first_text([
        page.locator("div[role='region']").filter(has_text=re.compile(r".+")),
        page.locator("[role='main'] div").filter(has_text=re.compile(r"From the business|Service options|Accessibility", re.I)),
    ], timeout_ms=500)


def extract_coordinates_from_url(url: str) -> tuple[str, str]:
    return parse_coordinates(url)
