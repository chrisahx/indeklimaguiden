# Company Enrichment Scraper

Batch scraper for enriching Danish varmepumpe installer companies from Google Maps and Trustpilot.

It builds on `scripts/google_maps_scraper/` and writes Astro-friendly JSON plus JSONL review files.

## Install

From the repository root:

```bash
python -m venv .venv-google-maps-scraper
source .venv-google-maps-scraper/bin/activate
pip install -r scripts/google_maps_scraper/requirements.txt
python -m playwright install chromium
```

## Input CSV

Default path:

```text
data/input/varmepumpe-installatorer.csv
```

Supported column names include Danish and English variants:

```text
id,name/navn,website/hjemmeside,url,city/by,address/adresse,phone/telefon,cvr
```

## Usage

Scrape the next 10 companies:

```bash
python -m scripts.company_enrichment.cli --input data/input/varmepumpe-installatorer.csv --batch-size 10
```

Update one company:

```bash
python -m scripts.company_enrichment.cli --company-id nova-solar-aalborg --force
```

Update one company by name:

```bash
python -m scripts.company_enrichment.cli --name "Nova Solar" --force
```

Run visible browser for debugging:

```bash
python -m scripts.company_enrichment.cli --batch-size 1 --headed --verbose
```

Only scrape one source:

```bash
python -m scripts.company_enrichment.cli --source google --batch-size 10
python -m scripts.company_enrichment.cli --source trustpilot --batch-size 10
```

## Outputs

```text
data/companies/companies.json
data/companies/scrape-state.json
data/companies/reviews/google-reviews.jsonl
data/companies/reviews/trustpilot-reviews.jsonl
data/companies/raw/google/{company_id}.json
data/companies/raw/trustpilot/{company_id}.json
```

`companies.json` is the primary Astro-friendly company index. Reviews are stored separately as JSONL and linked with `company_id`.

## Database direction

The website now uses Prisma migrations in `prisma/migrations` for the PostgreSQL schema and a development database in `docker-compose.yml`.

Recommended flow:

1. Keep scraping as a separate batch process.
2. Write raw JSON/JSONL files as an audit/debug artifact.
3. Add an ingestion step that upserts the normalized scraper output into PostgreSQL.
4. Let Astro SSR directory pages read from PostgreSQL with `DATABASE_URL`.

This keeps scraping failures, rate limits, and markup changes away from page requests, while still allowing company pages to update without rebuilding the static site.

## Notes

Google Maps and Trustpilot markup changes often. This scraper is deliberately conservative: it processes small batches, saves after each company, and marks failures/statuses so runs can be resumed safely.
