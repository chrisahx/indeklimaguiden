from __future__ import annotations

import logging
import random
import re
from datetime import datetime, timezone
from urllib.parse import quote_plus


def setup_logging(verbose: bool = False) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def clean_text(value: object) -> str:
    text = "" if value is None else str(value)
    return re.sub(r"\s+", " ", text).strip()


def maps_search_url(query: str, language: str = "da") -> str:
    return f"https://www.google.com/maps/search/{quote_plus(query)}?hl={quote_plus(language)}"


def random_delay(delay_min: float, delay_max: float) -> float:
    return random.uniform(delay_min, max(delay_min, delay_max))
