from __future__ import annotations


COUNTRY_CITIES: dict[str, list[str]] = {
    "denmark": [
        "Copenhagen",
        "Aarhus",
        "Odense",
        "Aalborg",
        "Esbjerg",
        "Randers",
        "Kolding",
        "Horsens",
        "Vejle",
        "Roskilde",
        "Herning",
        "Helsingor",
        "Silkeborg",
        "Naestved",
        "Fredericia",
        "Viborg",
        "Koge",
        "Holstebro",
        "Slagelse",
        "Hillerod",
        "Sonderborg",
        "Svendborg",
        "Hjorring",
        "Norresundby",
        "Frederikshavn",
    ]
}


def build_queries(category: str, country: str, city: str | None, strategy: str) -> list[tuple[str, str]]:
    if city:
        return [(f"{category} {city} {country}", city)]

    if strategy == "single-query":
        return [(f"{category} {country}", "")]

    cities = COUNTRY_CITIES.get(country.strip().lower())
    if not cities:
        return [(f"{category} {country}", "")]

    return [(f"{category} {location} {country}", location) for location in cities]
