from __future__ import annotations

import argparse
import asyncio
import logging
from pathlib import Path

from .config import ScraperConfig
from .exporter import CsvExporter
from .locations import build_queries
from .utils import setup_logging


LOGGER = logging.getLogger(__name__)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Unofficial Google Maps business scraper.")
    parser.add_argument("--category", "-q", required=True, help="Business category or search query.")
    parser.add_argument("--country", "-c", required=True, help="Country to scrape.")
    parser.add_argument("--output", "-o", required=True, type=Path, help="CSV output path.")
    parser.add_argument("--city", help="Optional city to scrape only.")
    parser.add_argument("--max-results", type=positive_int, help="Global result limit.")
    parser.add_argument("--max-per-query", type=positive_int, default=50, help="Maximum results per city/query.")
    parser.add_argument(
        "--country-strategy",
        choices=("city-list", "single-query"),
        default="city-list",
        help="Use known country city expansion or a single national query.",
    )
    parser.add_argument("--headless", dest="headless", action="store_true", default=True, help="Run Chromium headless.")
    parser.add_argument("--headed", dest="headless", action="store_false", help="Run Chromium visibly.")
    parser.add_argument("--language", default="en", help="Google Maps UI language.")
    parser.add_argument("--delay-min", type=non_negative_float, default=1.0, help="Minimum random delay between profile visits.")
    parser.add_argument("--delay-max", type=non_negative_float, default=3.0, help="Maximum random delay between profile visits.")
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


def non_negative_float(value: str) -> float:
    parsed = float(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("must be zero or greater")
    return parsed


def main() -> None:
    args = parse_args()
    setup_logging(args.verbose)

    config = ScraperConfig(
        headless=args.headless,
        language=args.language,
        delay_min=args.delay_min,
        delay_max=args.delay_max,
    )
    queries = build_queries(args.category, args.country, args.city, args.country_strategy)
    LOGGER.info("Prepared %s query/queries", len(queries))

    asyncio.run(run_scrape(config, queries, args.country, args.output, args.max_results, args.max_per_query))


async def run_scrape(
    config: ScraperConfig,
    queries: list[tuple[str, str]],
    country: str,
    output: Path,
    max_results: int | None,
    max_per_query: int | None,
) -> None:
    from .scraper import GoogleMapsScraper

    written = 0
    skipped_duplicates = 0

    with CsvExporter(output) as exporter:
        async with GoogleMapsScraper(config) as scraper:
            for query, city in queries:
                if max_results is not None and written >= max_results:
                    break

                LOGGER.info("Starting query: %s", query)
                async for result in scraper.scrape_query(query, city, country, max_per_query):
                    if exporter.write(result):
                        written += 1
                    else:
                        skipped_duplicates += 1

                    if max_results is not None and written >= max_results:
                        break

    LOGGER.info("Finished. Wrote %s rows to %s. Skipped %s duplicates.", written, output, skipped_duplicates)


if __name__ == "__main__":
    main()
