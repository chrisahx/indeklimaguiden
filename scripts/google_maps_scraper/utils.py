from __future__ import annotations

import logging
import random
import re
from datetime import datetime, timezone
from urllib.parse import quote_plus, urlparse, urlunparse


def setup_logging(verbose: bool = False) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def maps_search_url(query: str, language: str) -> str:
    return f"https://www.google.com/maps/search/{quote_plus(query)}?hl={language}"


def random_delay(min_seconds: float, max_seconds: float) -> float:
    return random.uniform(min_seconds, max_seconds)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def clean_label(value: str | None, prefixes: tuple[str, ...]) -> str:
    text = clean_text(value)
    lower = text.lower()
    for prefix in prefixes:
        normalized = prefix.lower().rstrip(":")
        if lower.startswith(normalized):
            return clean_text(text[len(prefix) :].lstrip(" :"))
    return text


def normalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url)
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))


def parse_coordinates(url: str) -> tuple[str, str]:
    patterns = (
        r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)",
        r"@(-?\d+\.\d+),(-?\d+\.\d+)",
    )
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1), match.group(2)
    return "", ""


def extract_number(text: str) -> str:
    match = re.search(r"[\d,.]+", text or "")
    return match.group(0) if match else ""
