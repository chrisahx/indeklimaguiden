# Google Maps Scraper

Unofficial Playwright-based Google Maps scraper for collecting business data into CSV.

This scraper does not visit company websites and does not extract emails. It only attempts to extract data visible in Google Maps.

## Install

From the repository root:

```bash
python -m venv .venv-google-maps-scraper
source .venv-google-maps-scraper/bin/activate
pip install -r scripts/google_maps_scraper/requirements.txt
python -m playwright install chromium
```

## Usage

Small visible browser test:

```bash
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --city "Copenhagen" \
  --max-results 10 \
  --max-per-query 10 \
  --headed \
  --output scripts/google_maps_scraper/output/test.csv
```

Country-wide Denmark scrape using the built-in city list:

```bash
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --max-results 500 \
  --max-per-query 50 \
  --output scripts/google_maps_scraper/output/aircondition_denmark.csv
```

Single national query instead of city expansion:

```bash
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --country-strategy single-query \
  --output scripts/google_maps_scraper/output/aircondition_denmark_single.csv
```

## Options

```text
--category           Required. Business category or search query.
--country            Required. Country name.
--output             Required. CSV output path.
--city               Optional. Scrape one city only.
--max-results        Optional. Global row limit.
--max-per-query      Optional. Max candidate listings per city/query. Default: 50.
--country-strategy   city-list or single-query. Default: city-list.
--headless/--headed  Run browser hidden or visible. Default: headless.
--language           Google Maps UI language. Default: en.
--delay-min          Minimum random delay between profile visits. Default: 1.0.
--delay-max          Maximum random delay between profile visits. Default: 3.0.
--verbose            Enable debug logging.
```

## CSV Columns

```text
name
category
phone
website
address
city
country
rating
review_count
opening_hours
description
google_maps_url
latitude
longitude
source_query
scraped_at
status
```

## Notes

Google Maps markup changes often. If fields start coming back empty, update selectors in `parser.py`.

Unofficial Google Maps scraping can trigger rate limits, captchas, or blocking. Use low limits first, run with `--headed` while debugging, and keep delays conservative.

Country-wide completeness is not guaranteed. The default `city-list` strategy for Denmark should generally find more businesses than a single national query.
