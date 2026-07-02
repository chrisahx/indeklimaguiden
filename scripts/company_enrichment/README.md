# Company Enrichment Scraper

Batch scraper for enriching Danish varmepumpe installer companies from Google Maps and Trustpilot.

It builds on `scripts/google_maps_scraper/` and writes company, source, review, location, and photo data directly to PostgreSQL.

## Install

From the repository root:

```bash
python -m venv .venv-google-maps-scraper
source .venv-google-maps-scraper/bin/activate
pip install -r scripts/company_enrichment/requirements.txt
python -m playwright install chromium
```

## Input CSV

Default path:

```text
data/input/varmepumpe-installatorer.csv
```

Supported column names include Danish and English variants:

```text
id,name/navn,website/hjemmeside,url,city/by,postal_code/postnummer/postnr,address/adresse,phone/telefon,cvr
```

## Usage

Scrape the next 10 companies:

```bash
python -m scripts.company_enrichment.cli --input data/input/varmepumpe-installatorer.csv --batch-size 10
```

The scraper reads `DATABASE_URL` from the environment or `.env` by default:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/indeklimaguiden
```

You can also pass a database explicitly, for example to target production:

```bash
python -m scripts.company_enrichment.cli \
  --database-url postgresql://user:password@host:5432/database \
  --batch-size 10
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

The scraper writes to the Prisma-managed PostgreSQL tables:

```text
companies
company_locations
company_sources
company_reviews
company_photos
```

Each `company_sources` row stores the normalized scraper output plus raw scrape details in `payload`. Reviews are replaced per `company_id` and source on each successful source scrape, preserving the old JSONL replacement behavior without creating duplicates.

## Database direction

The website now uses Prisma migrations in `prisma/migrations` for the PostgreSQL schema and a development database in `docker-compose.yml`.

Recommended flow:

1. Keep scraping as a separate batch process.
2. Run it against the desired database with `DATABASE_URL` or `--database-url`.
3. Let Astro SSR directory pages read from PostgreSQL with the same schema.

This keeps scraping failures, rate limits, and markup changes away from page requests, while still allowing company pages to update without rebuilding the static site.

## Notes

Google Maps and Trustpilot markup changes often. This scraper is deliberately conservative: it processes small batches, saves after each company, and marks failures/statuses so runs can be resumed safely.
