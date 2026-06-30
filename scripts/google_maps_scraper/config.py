from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ScraperConfig:
    headless: bool = True
    language: str = "en"
    delay_min: float = 1.0
    delay_max: float = 3.0
    navigation_timeout_ms: int = 45_000
    action_timeout_ms: int = 10_000
    scroll_pause_ms: int = 1_500
    max_scroll_attempts: int = 80
    max_stale_scrolls: int = 8
    user_agent: str = (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
