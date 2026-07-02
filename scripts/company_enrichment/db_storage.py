from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Iterable

from .matching import slugify
from .models import InputCompany, parse_postal_code_and_city


class PostgresCompanyStorage:
    def __init__(self, database_url: str) -> None:
        self.database_url = database_url
        self.connection = None

    def __enter__(self) -> PostgresCompanyStorage:
        from psycopg import connect
        from psycopg.rows import dict_row

        self.connection = connect(self.database_url, row_factory=dict_row, autocommit=True)
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        if self.connection:
            self.connection.close()

    def load_companies(self) -> dict[str, dict[str, object]]:
        connection = self._connection()
        companies: dict[str, dict[str, object]] = {}
        with connection.cursor() as cursor:
            cursor.execute(
                """
                select
                  c.id,
                  c.slug,
                  c.name,
                  c.cvr,
                  c.website,
                  c.phone,
                  c.email,
                  c.status,
                  c.is_claimed,
                  c.last_scraped_at,
                  l.address,
                  l.postal_code,
                  l.city,
                  l.country,
                  l.latitude,
                  l.longitude
                from companies c
                left join company_locations l on l.company_id = c.id
                order by c.name
                """
            )
            for row in cursor.fetchall():
                company = dict(row)
                companies[str(row["id"])] = {
                    "id": row["id"],
                    "slug": row["slug"],
                    "name": row["name"],
                    "cvr": row["cvr"] or "",
                    "website": row["website"] or "",
                    "phone": row["phone"] or "",
                    "email": row["email"] or "",
                    "status": row["status"],
                    "is_claimed": row["is_claimed"],
                    "last_scraped_at": iso_datetime(row["last_scraped_at"]),
                    "location": {
                        "address": company.get("address") or "",
                        "postal_code": company.get("postal_code") or "",
                        "city": company.get("city") or "",
                        "country": company.get("country") or "Denmark",
                        "latitude": decimal_to_string(company.get("latitude")),
                        "longitude": decimal_to_string(company.get("longitude")),
                    },
                    "meta": {"status": row["status"]},
                }

            cursor.execute(
                """
                select company_id, source, source_url, external_id, status, rating, review_count, payload, scraped_at
                from company_sources
                """
            )
            for row in cursor.fetchall():
                company = companies.get(str(row["company_id"]))
                if not company:
                    continue
                source_data = payload_dict(row["payload"])
                normalized = source_data.get("normalized") if isinstance(source_data.get("normalized"), dict) else source_data
                source = str(row["source"])
                company[source] = {
                    **normalized,
                    "status": row["status"],
                    "source_url": row["source_url"] or "",
                    "external_id": row["external_id"] or "",
                    "rating": decimal_to_string(row["rating"]),
                    "review_count": row["review_count"],
                    "last_scraped_at": iso_datetime(row["scraped_at"]),
                }

        return companies

    def upsert_base_company(self, input_company: InputCompany) -> dict[str, object]:
        connection = self._connection()
        payload = {"normalized": input_company.to_dict(), "input": input_company.to_dict()}
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    insert into companies (id, slug, name, cvr, website, phone, email)
                    values (%s, %s, %s, nullif(%s, ''), nullif(%s, ''), nullif(%s, ''), nullif(%s, ''))
                    on conflict (id) do update set
                      name = coalesce(nullif(companies.name, ''), excluded.name),
                      cvr = coalesce(companies.cvr, excluded.cvr),
                      website = coalesce(companies.website, excluded.website),
                      phone = coalesce(companies.phone, excluded.phone),
                      email = coalesce(companies.email, excluded.email)
                    returning id, slug, name, cvr, website, phone, email, status, last_scraped_at
                    """,
                    (
                        input_company.id,
                        slugify(input_company.id or input_company.name),
                        input_company.name,
                        input_company.cvr,
                        input_company.website,
                        input_company.phone,
                        input_company.email,
                    ),
                )
                company = dict(cursor.fetchone())
                cursor.execute(
                    """
                    insert into company_locations (company_id, address, postal_code, city, country)
                    values (%s, nullif(%s, ''), nullif(%s, ''), nullif(%s, ''), 'Denmark')
                    on conflict (company_id) do update set
                      address = coalesce(company_locations.address, excluded.address),
                      postal_code = coalesce(company_locations.postal_code, excluded.postal_code),
                      city = coalesce(company_locations.city, excluded.city),
                      country = coalesce(company_locations.country, excluded.country)
                    """,
                    (input_company.id, input_company.address, input_company.postal_code, input_company.city),
                )
                cursor.execute(
                    """
                    insert into company_sources (company_id, source, status, payload)
                    values (%s, 'input', 'ok', %s)
                    on conflict (company_id, source) do update set
                      status = excluded.status,
                      payload = excluded.payload
                    """,
                    (input_company.id, jsonb(payload)),
                )

        return {
            "id": company["id"],
            "slug": company["slug"],
            "name": company["name"],
            "cvr": company["cvr"] or input_company.cvr,
            "website": company["website"] or input_company.website,
            "phone": company["phone"] or input_company.phone,
            "email": company["email"] or input_company.email,
            "status": company["status"],
            "last_scraped_at": iso_datetime(company["last_scraped_at"]),
            "input": input_company.to_dict(),
            "location": {
                "address": input_company.address,
                "postal_code": input_company.postal_code,
                "city": input_company.city,
                "country": "Denmark",
            },
            "meta": {},
        }

    def save_google_result(
        self,
        company: dict[str, object],
        google_data: dict[str, object],
        reviews: Iterable[dict[str, object]],
        raw: dict[str, object],
    ) -> None:
        self._save_source_result(str(company["id"]), "google", google_data, reviews, raw)
        self._upsert_photos(str(company["id"]), "google", google_data.get("photos", []))
        self._update_company_from_google(str(company["id"]), google_data)

    def save_trustpilot_result(
        self,
        company: dict[str, object],
        trustpilot_data: dict[str, object],
        reviews: Iterable[dict[str, object]],
        raw: dict[str, object],
    ) -> None:
        self._save_source_result(str(company["id"]), "trustpilot", trustpilot_data, reviews, raw)

    def update_company_status(self, company_id: str, status: str) -> None:
        connection = self._connection()
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    update companies
                    set status = %s,
                        last_scraped_at = nullif(
                          greatest(
                            coalesce(last_scraped_at, '-infinity'::timestamptz),
                            coalesce((select max(scraped_at) from company_sources where company_id = %s), '-infinity'::timestamptz)
                          ),
                          '-infinity'::timestamptz
                        )
                    where id = %s
                    """,
                    (status, company_id, company_id),
                )

    def _save_source_result(
        self,
        company_id: str,
        source: str,
        source_data: dict[str, object],
        reviews: Iterable[dict[str, object]],
        raw: dict[str, object],
    ) -> None:
        connection = self._connection()
        payload = {"normalized": source_data, "raw": raw}
        scraped_at = parse_datetime(source_data.get("last_scraped_at")) or datetime.now(timezone.utc)
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    insert into company_sources (
                      company_id, source, source_url, external_id, status, rating, review_count, payload, scraped_at
                    )
                    values (%s, %s, nullif(%s, ''), nullif(%s, ''), %s, %s, %s, %s, %s)
                    on conflict (company_id, source) do update set
                      source_url = excluded.source_url,
                      external_id = excluded.external_id,
                      status = excluded.status,
                      rating = excluded.rating,
                      review_count = excluded.review_count,
                      payload = excluded.payload,
                      scraped_at = excluded.scraped_at
                    """,
                    (
                        company_id,
                        source,
                        source_url(source_data),
                        external_id(source, source_data),
                        str(source_data.get("status") or "unknown"),
                        decimal_or_none(source_data.get("rating")),
                        int_or_none(source_data.get("review_count")),
                        jsonb(payload),
                        scraped_at,
                    ),
                )
                cursor.execute("delete from company_reviews where company_id = %s and source = %s", (company_id, source))
                seen_review_ids: set[str] = set()
                for review in reviews:
                    review_id = str(review.get("review_id") or review.get("id") or "")
                    if not review_id or review_id in seen_review_ids:
                        continue
                    seen_review_ids.add(review_id)
                    cursor.execute(
                        """
                        insert into company_reviews (
                          id, company_id, source, source_url, author, title, body, rating,
                          rating_label, reviewed_at, reviewed_at_label, scraped_at, payload
                        )
                        values (%s, %s, %s, nullif(%s, ''), nullif(%s, ''), nullif(%s, ''), nullif(%s, ''), %s, nullif(%s, ''), %s, nullif(%s, ''), %s, %s)
                        """,
                        (
                            review_id,
                            company_id,
                            source,
                            str(review.get("profile_url") or review.get("source_url") or source_data.get("profile_url") or source_data.get("maps_url") or ""),
                            str(review.get("author") or ""),
                            str(review.get("title") or ""),
                            str(review.get("text") or review.get("body") or ""),
                            decimal_or_none(review.get("rating")),
                            str(review.get("rating_label") or ""),
                            parse_datetime(review.get("date")),
                            str(review.get("date") or review.get("reviewed_at_label") or ""),
                            parse_datetime(review.get("scraped_at")) or scraped_at,
                            jsonb(review),
                        ),
                    )

    def _update_company_from_google(self, company_id: str, google_data: dict[str, object]) -> None:
        connection = self._connection()
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    update companies set
                      name = coalesce(nullif(%s, ''), name),
                      cvr = coalesce(nullif(%s, ''), cvr),
                      website = coalesce(nullif(%s, ''), website),
                      phone = coalesce(nullif(%s, ''), phone),
                      email = coalesce(nullif(%s, ''), email)
                    where id = %s
                    """,
                    (
                        str(google_data.get("name") or ""),
                        str(google_data.get("cvr") or ""),
                        str(google_data.get("website") or ""),
                        str(google_data.get("phone") or ""),
                        str(google_data.get("email") or ""),
                        company_id,
                    ),
                )
                postal_code, city = google_location_parts(google_data)
                cursor.execute(
                    """
                    insert into company_locations (company_id, address, postal_code, city, country, latitude, longitude)
                    values (%s, nullif(%s, ''), nullif(%s, ''), nullif(%s, ''), 'Denmark', %s, %s)
                    on conflict (company_id) do update set
                      address = coalesce(excluded.address, company_locations.address),
                      postal_code = coalesce(excluded.postal_code, company_locations.postal_code),
                      city = coalesce(excluded.city, company_locations.city),
                      country = coalesce(company_locations.country, excluded.country),
                      latitude = coalesce(excluded.latitude, company_locations.latitude),
                      longitude = coalesce(excluded.longitude, company_locations.longitude)
                    """,
                    (
                        company_id,
                        str(google_data.get("address") or ""),
                        postal_code,
                        city,
                        decimal_or_none(google_data.get("latitude")),
                        decimal_or_none(google_data.get("longitude")),
                    ),
                )

    def _upsert_photos(self, company_id: str, source: str, photos: object) -> None:
        if not isinstance(photos, list):
            return
        connection = self._connection()
        with connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute("delete from company_photos where company_id = %s and source = %s", (company_id, source))
                for index, photo in enumerate(photos):
                    if not isinstance(photo, dict) or not photo.get("url"):
                        continue
                    cursor.execute(
                        """
                        insert into company_photos (company_id, source, url, alt, position, payload)
                        values (%s, %s, %s, nullif(%s, ''), %s, %s)
                        on conflict (company_id, source, url) do update set
                          alt = excluded.alt,
                          position = excluded.position,
                          payload = excluded.payload
                        """,
                        (company_id, source, str(photo["url"]), str(photo.get("alt") or ""), index, jsonb(photo)),
                    )

    def _connection(self):
        if not self.connection:
            raise RuntimeError("PostgresCompanyStorage must be used as a context manager")
        return self.connection


def jsonb(value: object):
    from psycopg.types.json import Jsonb

    return Jsonb(value)


def payload_dict(value: object) -> dict[str, object]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}


def parse_datetime(value: object) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def iso_datetime(value: object) -> str:
    if not isinstance(value, datetime):
        return ""
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def decimal_to_string(value: object) -> str:
    return "" if value is None else str(value)


def decimal_or_none(value: object) -> Decimal | None:
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value).replace(",", "."))
    except (InvalidOperation, ValueError):
        return None


def int_or_none(value: object) -> int | None:
    if value in (None, ""):
        return None
    if isinstance(value, int):
        return value
    digits = re.sub(r"[^0-9]", "", str(value))
    return int(digits) if digits else None


def source_url(source_data: dict[str, object]) -> str:
    return str(source_data.get("maps_url") or source_data.get("profile_url") or source_data.get("source_url") or "")


def external_id(source: str, source_data: dict[str, object]) -> str:
    if source == "trustpilot":
        return str(source_data.get("domain") or "")
    return str(source_data.get("place_id") or source_data.get("maps_url") or "")


def google_location_parts(google_data: dict[str, object]) -> tuple[str, str]:
    postal_code = str(google_data.get("postal_code") or "")
    city = str(google_data.get("city") or "")
    parsed = parse_postal_code_and_city(str(google_data.get("address") or ""))
    if parsed:
        postal_code = postal_code or parsed[0]
        city = city or parsed[1]
    return postal_code, city
