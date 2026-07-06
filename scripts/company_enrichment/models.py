from __future__ import annotations

import re
from dataclasses import dataclass

from .contact import extract_contact_details, split_name_and_cvr
from .matching import company_id


@dataclass(slots=True)
class InputCompany:
    id: str
    name: str
    website: str = ""
    city: str = ""
    postal_code: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    cvr: str = ""

    @classmethod
    def from_row(cls, row: dict[str, str]) -> InputCompany:
        normalized = {key.strip().lower(): (value or "").strip() for key, value in row.items()}
        raw_name = normalized.get("name") or normalized.get("navn") or normalized.get("company") or normalized.get("virksomhed") or ""
        city = normalized.get("city") or normalized.get("by") or ""
        postal_code = normalized.get("postal_code") or normalized.get("postcode") or normalized.get("zip") or normalized.get("postnummer") or normalized.get("postnr") or ""
        website = normalized.get("website") or normalized.get("hjemmeside") or normalized.get("url") or ""
        contact = extract_contact_details(normalized.get("contact") or normalized.get("kontakt") or "")
        name, cvr = split_name_and_cvr(raw_name, normalized.get("cvr") or "")
        address = normalized.get("address") or normalized.get("adresse") or ""
        if not postal_code:
            postal_code, parsed_city = parse_postal_code_and_city(city) or parse_postal_code_and_city(address) or ("", "")
            city = parsed_city or city
        return cls(
            id=normalized.get("id") or company_id(name, city, website),
            name=name,
            website=website,
            city=city,
            postal_code=postal_code,
            address=address,
            phone=normalized.get("phone") or normalized.get("telefon") or str(contact.get("phone") or ""),
            email=normalized.get("email") or normalized.get("e-mail") or str(contact.get("email") or ""),
            cvr=cvr,
        )

    def to_dict(self) -> dict[str, str]:
        return {
            "id": self.id,
            "name": self.name,
            "website": self.website,
            "city": self.city,
            "postal_code": self.postal_code,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "cvr": self.cvr,
        }


def parse_postal_code_and_city(value: str) -> tuple[str, str] | None:
    match = re.search(r"(?:^|[\s,])(?P<postal_code>\d{4})\s+(?P<city>[^,]+)", value or "")
    if not match:
        return None
    return match.group("postal_code"), match.group("city").strip()
