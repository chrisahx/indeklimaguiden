from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ScraperConfig:
    headless: bool = True
    language: str = "da"
    delay_min: float = 5.0
    delay_max: float = 15.0
    navigation_timeout_ms: int = 45_000
    action_timeout_ms: int = 10_000
    user_agent: str = (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    )
