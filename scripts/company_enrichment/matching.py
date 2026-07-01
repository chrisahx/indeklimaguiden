from __future__ import annotations

import re
import unicodedata
from urllib.parse import urlparse


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "company"


def company_id(name: str, city: str = "", website: str = "") -> str:
    parts = [name]
    if city:
        parts.append(city)
    elif website:
        parts.append(normalize_domain(website))
    return slugify(" ".join(part for part in parts if part))


def normalize_domain(url_or_domain: str) -> str:
    value = (url_or_domain or "").strip().lower()
    if not value:
        return ""
    if "://" not in value:
        value = f"https://{value}"
    parsed = urlparse(value)
    host = parsed.netloc or parsed.path.split("/")[0]
    if host.startswith("www."):
        host = host[4:]
    return host.rstrip(".")


def normalized_name(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"\b(a/s|aps|as|ivs|i/s|ab)\b", " ", text.lower())
    text = re.sub(r"\b(firma|v/.*)$", "", text).strip()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def score_google_match(input_company: dict[str, str], result: dict[str, object]) -> int:
    score = 0
    input_name = normalized_name(input_company.get("name", ""))
    result_name = normalized_name(str(result.get("name", "")))
    input_city = (input_company.get("city") or "").lower()
    result_address = str(result.get("address", "")).lower()
    input_domain = normalize_domain(input_company.get("website", ""))
    result_domain = normalize_domain(str(result.get("website", "")))

    if input_name and result_name:
        if input_name == result_name:
            score += 60
        elif input_name in result_name or result_name in input_name:
            score += 40
        elif set(input_name.split()) & set(result_name.split()):
            score += 15

    if input_city and input_city in result_address:
        score += 15
    if input_domain and result_domain and input_domain == result_domain:
        score += 80

    return score
