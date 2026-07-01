from __future__ import annotations

from dataclasses import dataclass

from .contact import extract_contact_details, split_name_and_cvr
from .matching import company_id


@dataclass(slots=True)
class InputCompany:
    id: str
    name: str
    website: str = ""
    city: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    cvr: str = ""

    @classmethod
    def from_row(cls, row: dict[str, str]) -> InputCompany:
        normalized = {key.strip().lower(): (value or "").strip() for key, value in row.items()}
        raw_name = normalized.get("name") or normalized.get("navn") or normalized.get("company") or normalized.get("virksomhed") or ""
        city = normalized.get("city") or normalized.get("by") or ""
        website = normalized.get("website") or normalized.get("hjemmeside") or normalized.get("url") or ""
        contact = extract_contact_details(normalized.get("contact") or normalized.get("kontakt") or "")
        name, cvr = split_name_and_cvr(raw_name, normalized.get("cvr") or "")
        return cls(
            id=normalized.get("id") or company_id(name, city, website),
            name=name,
            website=website,
            city=city,
            address=normalized.get("address") or normalized.get("adresse") or "",
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
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "cvr": self.cvr,
        }
