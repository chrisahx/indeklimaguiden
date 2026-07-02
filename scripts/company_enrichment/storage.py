from __future__ import annotations

import csv
import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Iterable

from .models import InputCompany


def load_input_companies(path: Path) -> list[InputCompany]:
    if not path.exists():
        raise FileNotFoundError(f"Input CSV does not exist: {path}")
    with path.open(newline="", encoding="utf-8-sig") as file:
        return [InputCompany.from_row(row) for row in csv.DictReader(file) if any(row.values())]


def load_json(path: Path, default: object) -> object:
    if not path.exists():
        return default
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as file:
        json.dump(data, file, ensure_ascii=False, indent=2, sort_keys=True)
        file.write("\n")
        temp_path = Path(file.name)
    temp_path.replace(path)


def load_companies(path: Path) -> dict[str, dict[str, object]]:
    rows = load_json(path, [])
    if not isinstance(rows, list):
        raise ValueError(f"Expected list in {path}")
    return {str(row["id"]): row for row in rows if isinstance(row, dict) and row.get("id")}


def save_companies(path: Path, companies: dict[str, dict[str, object]]) -> None:
    write_json(path, sorted(companies.values(), key=lambda row: str(row.get("name", "")).lower()))


def upsert_base_company(companies: dict[str, dict[str, object]], input_company: InputCompany) -> dict[str, object]:
    company = companies.setdefault(input_company.id, {})
    company.setdefault("id", input_company.id)
    company.setdefault("name", input_company.name)
    if input_company.cvr and not company.get("cvr"):
        company["cvr"] = input_company.cvr
    if input_company.website and not company.get("website"):
        company["website"] = input_company.website
    if input_company.phone and not company.get("phone"):
        company["phone"] = input_company.phone
    if input_company.email and not company.get("email"):
        company["email"] = input_company.email
    company["input"] = input_company.to_dict()
    location = company.setdefault("location", {})
    if isinstance(location, dict):
        if input_company.address and not location.get("address"):
            location["address"] = input_company.address
        if input_company.postal_code and not location.get("postal_code"):
            location["postal_code"] = input_company.postal_code
        if input_company.city and not location.get("city"):
            location["city"] = input_company.city
        location.setdefault("country", "Denmark")
    company.setdefault("meta", {})
    return company


def replace_reviews(path: Path, company_id: str, source: str, reviews: Iterable[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    existing: list[dict[str, object]] = []
    if path.exists():
        with path.open(encoding="utf-8") as file:
            for line in file:
                if not line.strip():
                    continue
                row = json.loads(line)
                if row.get("company_id") == company_id and row.get("source") == source:
                    continue
                existing.append(row)

    existing.extend(reviews)
    with NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as file:
        for row in existing:
            json.dump(row, file, ensure_ascii=False, sort_keys=True)
            file.write("\n")
        temp_path = Path(file.name)
    temp_path.replace(path)


def write_raw(path: Path, data: object) -> None:
    write_json(path, data)
