from __future__ import annotations

from dataclasses import asdict, dataclass, fields


@dataclass(slots=True)
class BusinessResult:
    name: str = ""
    category: str = ""
    phone: str = ""
    website: str = ""
    address: str = ""
    city: str = ""
    country: str = ""
    rating: str = ""
    review_count: str = ""
    opening_hours: str = ""
    description: str = ""
    google_maps_url: str = ""
    latitude: str = ""
    longitude: str = ""
    source_query: str = ""
    scraped_at: str = ""
    status: str = ""

    def to_row(self) -> dict[str, str]:
        return asdict(self)


CSV_FIELDS = [field.name for field in fields(BusinessResult)]
