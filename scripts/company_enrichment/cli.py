from __future__ import annotations

import argparse
import asyncio
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

from scripts.google_maps_scraper.config import ScraperConfig
from scripts.google_maps_scraper.utils import setup_logging, utc_now_iso

from .contact import split_name_and_cvr
from .google_maps import scrape_google_company
from .models import InputCompany
from .storage import (
    load_companies,
    load_input_companies,
    load_json,
    replace_reviews,
    save_companies,
    upsert_base_company,
    write_json,
    write_raw,
)
from .trustpilot import scrape_trustpilot_company


LOGGER = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Enrich installer companies from Google Maps and Trustpilot.")
    parser.add_argument("--input", type=Path, default=Path("data/input/varmepumpe-installatorer.csv"), help="Input CSV with companies.")
    parser.add_argument("--output-dir", type=Path, default=Path("data/companies"), help="Output directory for JSON data.")
    parser.add_argument("--batch-size", type=positive_int, default=10, help="Companies to scrape per run. Default: 10.")
    parser.add_argument("--company-id", help="Scrape/update one company id.")
    parser.add_argument("--name", help="Scrape/update one company by name substring.")
    parser.add_argument("--source", choices=("all", "google", "trustpilot", "input"), default="all", help="Which source to scrape or import.")
    parser.add_argument("--force", action="store_true", help="Scrape even when data already exists.")
    parser.add_argument("--stale-days", type=positive_int, default=30, help="Re-scrape source data older than this many days.")
    parser.add_argument("--max-google-reviews", type=non_negative_int, default=100, help="Max Google reviews per company. 0 means try all.")
    parser.add_argument("--max-trustpilot-reviews", type=non_negative_int, default=100, help="Max Trustpilot reviews per company. 0 means try all.")
    parser.add_argument("--google-candidate-limit", type=positive_int, default=2, help="Max Google Maps candidates to inspect per query. Default: 2.")
    parser.add_argument("--headless", dest="headless", action="store_true", default=True, help="Run Chromium headless.")
    parser.add_argument("--headed", dest="headless", action="store_false", help="Run Chromium visibly.")
    parser.add_argument("--language", default="da", help="Google Maps language. Default: da.")
    parser.add_argument("--delay-min", type=non_negative_float, default=5.0, help="Minimum delay between Google profile visits.")
    parser.add_argument("--delay-max", type=non_negative_float, default=15.0, help="Maximum delay between Google profile visits.")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable debug logging.")
    args = parser.parse_args()
    if args.delay_max < args.delay_min:
        parser.error("--delay-max must be greater than or equal to --delay-min")
    return args


def positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return parsed


def non_negative_int(value: str) -> int:
    parsed = int(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("must be zero or greater")
    return parsed


def non_negative_float(value: str) -> float:
    parsed = float(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("must be zero or greater")
    return parsed


def main() -> None:
    args = parse_args()
    setup_logging(args.verbose)
    asyncio.run(run(args))


async def run(args: argparse.Namespace) -> None:
    companies_path = args.output_dir / "companies.json"
    state_path = args.output_dir / "scrape-state.json"
    google_reviews_path = args.output_dir / "reviews" / "google-reviews.jsonl"
    trustpilot_reviews_path = args.output_dir / "reviews" / "trustpilot-reviews.jsonl"
    raw_google_dir = args.output_dir / "raw" / "google"
    raw_trustpilot_dir = args.output_dir / "raw" / "trustpilot"

    companies = load_companies(companies_path)
    state = load_json(state_path, {"companies": {}})
    if not isinstance(state, dict):
        state = {"companies": {}}
    state.setdefault("companies", {})

    inputs = load_input_companies(args.input) if args.input.exists() else inputs_from_existing(companies)
    selected = select_companies(inputs, companies, args)
    if not selected:
        LOGGER.info("No companies selected for scraping.")
        return

    config = ScraperConfig(headless=args.headless, language=args.language, delay_min=args.delay_min, delay_max=args.delay_max)
    LOGGER.info("Selected %s company/companies", len(selected))

    for index, input_company in enumerate(selected, start=1):
        LOGGER.info("[%s/%s] Enriching %s (%s)", index, len(selected), input_company.name, input_company.id)
        company = upsert_base_company(companies, input_company)
        company_meta = ensure_dict(company, "meta")
        state_company = ensure_state_company(state, input_company.id)

        if args.source in ("all", "google") and should_scrape(company, "google", args.force, args.stale_days):
            google_data, google_reviews, google_raw = await scrape_google_company(input_company, config, args.max_google_reviews, args.google_candidate_limit)
            merge_google(company, google_data)
            replace_reviews(google_reviews_path, input_company.id, "google", google_reviews)
            write_raw(raw_google_dir / f"{input_company.id}.json", google_raw)
            state_company["google_status"] = google_data.get("status", "unknown")
            state_company["google_last_scraped_at"] = utc_now_iso()
            LOGGER.info("Google status for %s: %s (%s reviews)", input_company.id, google_data.get("status"), len(google_reviews))

        if args.source in ("all", "trustpilot") and should_scrape(company, "trustpilot", args.force, args.stale_days):
            website = str(company.get("website") or input_company.website or "")
            trustpilot_data, trustpilot_reviews, trustpilot_raw = await scrape_trustpilot_company(input_company, website, config, args.max_trustpilot_reviews)
            company["trustpilot"] = trustpilot_data
            replace_reviews(trustpilot_reviews_path, input_company.id, "trustpilot", trustpilot_reviews)
            write_raw(raw_trustpilot_dir / f"{input_company.id}.json", trustpilot_raw)
            state_company["trustpilot_status"] = trustpilot_data.get("status", "unknown")
            state_company["trustpilot_last_scraped_at"] = utc_now_iso()
            LOGGER.info("Trustpilot status for %s: %s (%s reviews)", input_company.id, trustpilot_data.get("status"), len(trustpilot_reviews))

        company_meta["status"] = combined_status(company)
        company_meta["last_updated_at"] = utc_now_iso()
        state_company["last_updated_at"] = company_meta["last_updated_at"]
        save_companies(companies_path, companies)
        write_json(state_path, state)

    state["last_run_at"] = utc_now_iso()
    save_companies(companies_path, companies)
    write_json(state_path, state)
    LOGGER.info("Finished enrichment. Wrote %s", companies_path)


def inputs_from_existing(companies: dict[str, dict[str, object]]) -> list[InputCompany]:
    rows: list[InputCompany] = []
    for company in companies.values():
        location = company.get("location") if isinstance(company.get("location"), dict) else {}
        rows.append(InputCompany(
            id=str(company.get("id", "")),
            name=str(company.get("name", "")),
            website=str(company.get("website", "")),
            city=str(location.get("city", "")) if isinstance(location, dict) else "",
            address=str(location.get("address", "")) if isinstance(location, dict) else "",
            phone=str(company.get("phone", "")),
            email=str(company.get("email", "")),
            cvr=str(company.get("cvr", "")),
        ))
    return rows


def select_companies(inputs: list[InputCompany], companies: dict[str, dict[str, object]], args: argparse.Namespace) -> list[InputCompany]:
    if args.company_id:
        return [company for company in inputs if company.id == args.company_id]
    if args.name:
        needle = args.name.lower()
        return [company for company in inputs if needle in company.name.lower()][:1]
    if args.source == "input":
        return inputs[: args.batch_size]
    selected: list[InputCompany] = []
    for input_company in inputs:
        company = companies.get(input_company.id, {})
        if args.source == "google" and not should_scrape(company, "google", args.force, args.stale_days):
            continue
        if args.source == "trustpilot" and not should_scrape(company, "trustpilot", args.force, args.stale_days):
            continue
        if args.source == "all" and not (
            should_scrape(company, "google", args.force, args.stale_days)
            or should_scrape(company, "trustpilot", args.force, args.stale_days)
        ):
            continue
        selected.append(input_company)
        if len(selected) >= args.batch_size:
            break
    return selected


def should_scrape(company: dict[str, object], source: str, force: bool, stale_days: int) -> bool:
    if force:
        return True
    source_data = company.get(source)
    if not isinstance(source_data, dict) or not source_data.get("status"):
        return True
    status = str(source_data.get("status", ""))
    if status.startswith("error") or status == "blocked":
        return True
    if source == "trustpilot" and status == "not_checked_no_website" and company.get("website"):
        return True
    scraped_at = str(source_data.get("last_scraped_at", ""))
    if not scraped_at:
        return True
    try:
        parsed = datetime.fromisoformat(scraped_at.replace("Z", "+00:00"))
    except ValueError:
        return True
    return parsed < datetime.now(timezone.utc) - timedelta(days=stale_days)


def merge_google(company: dict[str, object], google_data: dict[str, object]) -> None:
    company["google"] = google_data
    if google_data.get("cvr"):
        company["cvr"] = google_data["cvr"]
    if google_data.get("website"):
        company["website"] = google_data["website"]
    if google_data.get("phone"):
        company["phone"] = google_data["phone"]
    if google_data.get("email"):
        company["email"] = google_data["email"]
    if google_data.get("name"):
        name, cvr = split_name_and_cvr(str(google_data["name"]), str(company.get("cvr", "")))
        company["name"] = name
        if cvr:
            company["cvr"] = cvr
    location = ensure_dict(company, "location")
    for source_key, target_key in (("address", "address"), ("latitude", "latitude"), ("longitude", "longitude")):
        if google_data.get(source_key):
            location[target_key] = google_data[source_key]
    location.setdefault("country", "Denmark")


def ensure_dict(parent: dict[str, object], key: str) -> dict[str, object]:
    value = parent.get(key)
    if not isinstance(value, dict):
        value = {}
        parent[key] = value
    return value


def ensure_state_company(state: dict[str, object], company_id: str) -> dict[str, object]:
    companies = state.setdefault("companies", {})
    if not isinstance(companies, dict):
        companies = {}
        state["companies"] = companies
    row = companies.setdefault(company_id, {})
    if not isinstance(row, dict):
        row = {}
        companies[company_id] = row
    return row


def combined_status(company: dict[str, object]) -> str:
    statuses = []
    for source in ("google", "trustpilot"):
        data = company.get(source)
        if isinstance(data, dict):
            statuses.append(str(data.get("status", "")))
    if statuses and all(status == "ok" for status in statuses):
        return "scraped"
    if any(status.startswith("error") for status in statuses):
        return "partial"
    if any(status in {"not_found", "needs_manual_review"} for status in statuses):
        return "partial"
    return "pending"


if __name__ == "__main__":
    main()
