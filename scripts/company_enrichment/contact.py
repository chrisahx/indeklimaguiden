from __future__ import annotations

import re

from scripts.google_maps_scraper.utils import clean_text


EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
CVR_RE = re.compile(r"(?:\bCVR\b\.?|\bCVR[- ]?nr\b\.?|\bCVR[- ]?nummer\b\.?)\s*[:#-]?\s*(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})", re.I)
PHONE_RE = re.compile(r"(?:\+45\s*)?(?:\d{2}[\s.-]?){3}\d{2}\b")


def split_name_and_cvr(name: str, existing_cvr: str = "") -> tuple[str, str]:
    text = clean_text(name)
    cvr = normalize_cvr(existing_cvr)
    match = CVR_RE.search(text)
    if match:
        cvr = normalize_cvr(match.group(1)) or cvr
        text = clean_text((text[: match.start()] + text[match.end() :]).strip(" -,:()"))
    return text, cvr


def normalize_cvr(value: str) -> str:
    digits = re.sub(r"\D+", "", value or "")
    return digits if len(digits) == 8 else ""


def extract_emails(text: str) -> list[str]:
    seen: set[str] = set()
    emails: list[str] = []
    for match in EMAIL_RE.finditer(text or ""):
        email = match.group(0).lower()
        if email not in seen:
            seen.add(email)
            emails.append(email)
    return emails


def extract_phones(text: str) -> list[str]:
    seen: set[str] = set()
    phones: list[str] = []
    for match in PHONE_RE.finditer(text or ""):
        prefix = (text or "")[max(0, match.start() - 20) : match.start()].lower()
        if "cvr" in prefix:
            continue
        phone = clean_phone(match.group(0))
        if phone and phone not in seen:
            seen.add(phone)
            phones.append(phone)
    return phones


def clean_phone(value: str) -> str:
    digits = re.sub(r"\D+", "", value or "")
    if digits.startswith("45") and len(digits) == 10:
        return f"+45 {digits[2:4]} {digits[4:6]} {digits[6:8]} {digits[8:10]}"
    if len(digits) == 8:
        return f"{digits[0:2]} {digits[2:4]} {digits[4:6]} {digits[6:8]}"
    return clean_text(value)


def extract_contact_details(text: str) -> dict[str, object]:
    emails = extract_emails(text)
    phones = extract_phones(text)
    contact: dict[str, object] = {}
    if emails:
        contact["email"] = emails[0]
        contact["emails"] = emails
    if phones:
        contact["phone"] = phones[0]
        contact["phones"] = phones
    return contact
