---
name: google-maps-ai-lead-validator
description: "Runs the local Google Maps scraper and validates scraped business leads with AI website checks. Activate when the user asks to scrape Google Maps for local businesses, shops, sellers, installers, webshops, or leads in a city/country and qualify whether they match a target service/product."
risk: medium
source: local
date_added: "2026-07-01"
---

# Google Maps AI Lead Validator

## Overview

Use this skill to turn Google Maps search results into a qualified lead list. It combines the local scraper in `scripts/google_maps_scraper/` with AI-assisted website validation.

The scraper collects candidate businesses from Google Maps into CSV. The AI then reads that CSV, visits or fetches business websites where possible, looks for evidence that each business matches the requested product/service, and writes an enriched validation CSV.

This skill is especially useful for Danish local business research, such as finding aircondition sellers, varmepumpe installers, HVAC shops, indeklima retailers, affugter sellers, luftrenser shops, and similar commercial leads.

## When To Use This Skill

- Use when the user asks to scrape Google Maps for businesses in a specific city, region, or country.
- Use when the user asks for local sellers, shops, installers, contractors, showrooms, dealers, or webshops.
- Use when the user wants scraped Google Maps results checked against websites for relevance or validity.
- Use when the requested output is a qualified CSV, shortlist, lead list, prospect list, or evidence-backed business list.
- Use when the task depends on the local scraper under `scripts/google_maps_scraper/`.

## Do Not Use This Skill

- Do not use for normal article writing, SEO briefs, or internal linking unless the user specifically asks for external business lead research.
- Do not use for personal data enrichment, private individuals, employee scraping, or email harvesting.
- Do not claim the scrape is exhaustive. Google Maps coverage, rankings, and website availability are incomplete.

## Local Scraper Reference

Scraper directory:

```text
scripts/google_maps_scraper/
```

Run command pattern from the repository root:

```bash
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --city "Aarhus" \
  --max-results 30 \
  --max-per-query 30 \
  --output scripts/google_maps_scraper/output/aircondition_aarhus.csv
```

Useful options:

- `--category`: Search query or business category, required.
- `--country`: Country name, required.
- `--city`: Optional city-specific scrape.
- `--max-results`: Global row limit.
- `--max-per-query`: Max candidate listings for each query.
- `--country-strategy city-list`: Default for country-wide searches.
- `--country-strategy single-query`: One national query instead of city expansion.
- `--headed`: Use when debugging captchas, blocking, or empty output.
- `--delay-min` and `--delay-max`: Increase when Google rate limits.

Expected scraper CSV columns:

```text
name, category, phone, website, address, city, country, rating, review_count,
opening_hours, description, google_maps_url, latitude, longitude, source_query,
scraped_at, status
```

## Workflow

### Step 1: Clarify Inputs If Needed

If any required value is missing, ask one short question before running the scraper.

Required values:

- Target product/service, for example `aircondition`, `varmepumpe`, `affugter`, or `luftrenser`.
- Location, for example `Aarhus, Denmark` or `Denmark`.
- Desired scale if not obvious, for example `max 30 results` or `country-wide up to 500`.

If the user gives enough information, do not ask. Choose sensible defaults:

- `country`: `Denmark` for Danish place names.
- `max-results`: `30` for city-level searches.
- `max-per-query`: same as `max-results` for single-city searches.
- `category`: convert the request into a concise Google Maps query, such as `Aircondition Forhandler`, `Varmepumpe Installatør`, or `Luftrenser Forhandler`.

### Step 2: Run The Scraper

Run from the repository root. Prefer headless first.

Use output filenames that preserve topic and location:

```text
scripts/google_maps_scraper/output/{topic}_{location}.csv
```

Examples:

```text
scripts/google_maps_scraper/output/aircondition_aarhus.csv
scripts/google_maps_scraper/output/varmepumpe_denmark.csv
scripts/google_maps_scraper/output/affugter_odense.csv
```

If the scraper fails because dependencies are missing, follow the local README:

```bash
python -m venv .venv-google-maps-scraper
source .venv-google-maps-scraper/bin/activate
pip install -r scripts/google_maps_scraper/requirements.txt
python -m playwright install chromium
```

If Google blocks or captchas the run, retry only after making a meaningful change, such as using `--headed`, lowering limits, or increasing delays. Do not repeatedly hammer Google Maps.

### Step 3: Read And Triage The CSV

Read the generated CSV and identify rows with websites first. Rows without websites can still be retained, but mark them as `not_checked_no_website` unless the Google Maps description clearly proves relevance.

Initial triage rules:

- Keep rows with a plausible local business name, address, phone, or Google Maps URL.
- Deprioritize obvious unrelated businesses even if the search query matched loosely.
- Deduplicate by normalized website, Google Maps URL, or name/address.
- Preserve original scraper columns in the final output.

### Step 4: Validate Websites

For each row with a website, fetch or open the site and look for direct evidence. Use the available tools in this order:

1. `webfetch` for normal static pages.
2. Browser or Playwright-style access if available and the site needs JavaScript.
3. Direct likely URLs if the homepage is vague, such as `/produkter`, `/shop`, `/webshop`, `/aircondition`, `/varmepumpe`, `/koeling`, `/klimaanlaeg`, `/service`, `/installation`, `/kontakt`.

Search for Danish and English evidence terms relevant to the user request.

For aircondition leads, useful terms include:

- `aircondition`
- `airconditionanlæg`
- `klimaanlæg`
- `køling`
- `komfortkøling`
- `varmepumpe`
- `luft til luft`
- `installation`
- `service`
- `montage`
- `forhandler`
- `webshop`
- `produkter`
- `showroom`

For each business, capture the strongest evidence as a short quote or summary and the URL where it was found.

### Step 5: Classify Each Lead

Use conservative labels. Do not infer more than the website supports.

Recommended validation columns:

```text
ai_validation_status
ai_confidence
sells_target_product
business_type
has_local_presence
has_webshop
has_product_pages
offers_installation_or_service
evidence_url
evidence_text
ai_notes
checked_at
```

Allowed `ai_validation_status` values:

- `valid`: Clear evidence the business sells, installs, services, or displays the requested product/service.
- `likely_valid`: Strong contextual evidence, but not fully explicit.
- `uncertain`: Some related signals, but not enough to qualify confidently.
- `irrelevant`: Website indicates a different business type or unrelated offering.
- `not_checked_no_website`: No usable website was available.
- `not_checked_fetch_failed`: Website existed, but could not be fetched or checked.

Allowed `ai_confidence` values:

- `high`
- `medium`
- `low`

Suggested `business_type` values:

- `local_shop_or_showroom`
- `installer_or_service_company`
- `webshop`
- `retailer_or_dealer`
- `manufacturer_or_brand`
- `general_contractor`
- `directory_or_marketplace`
- `unrelated`
- `unknown`

Set booleans as `yes`, `no`, or `unclear`, not Python/JSON booleans, to keep CSV readable.

### Step 6: Write Enriched Output

Write the enriched CSV next to the scraper output:

```text
scripts/google_maps_scraper/output/{topic}_{location}.validated.csv
```

Preserve all original scraper columns and append validation columns. Do not overwrite the raw scraper output.

If only a manual shortlist is requested, still prefer creating the validated CSV and then summarize the best leads in the chat.

### Step 7: Summarize Results

After validation, report:

- Raw rows scraped.
- Rows with websites.
- Rows validated as `valid` or `likely_valid`.
- Rows marked `uncertain`, `irrelevant`, or not checked.
- Path to the raw CSV.
- Path to the validated CSV.
- Top qualified leads with one-line evidence.

## Evidence Rules

- Always include `evidence_url` for `valid`, `likely_valid`, or `uncertain` classifications when a website was checked.
- Always include a concise `evidence_text` snippet or factual observation.
- Never mark `valid` based only on the Google Maps category if the website contradicts it.
- Prefer `likely_valid` or `uncertain` when evidence is indirect.
- Do not invent capabilities such as webshop, showroom, installation, or local service area.
- If a site is unavailable, blocked, or empty, mark it as `not_checked_fetch_failed` and explain briefly in `ai_notes`.

## Danish Market Notes

For Denmark, aircondition and cooling services are often described through related terms rather than only `aircondition`. A valid lead may call the product/service:

- `klimaanlæg`
- `komfortkøling`
- `køleanlæg`
- `luft til luft-varmepumpe med køl`
- `varmepumpe`
- `ventilation og køling`

Be careful with broad `varmepumpe` companies: many sell heating-only solutions, but air-to-air heat pumps often include cooling. Mark as `valid` for aircondition only when cooling, aircondition, climate control, or relevant product pages are explicit. Otherwise use `likely_valid` or `uncertain`.

## Output Example

```text
Created:
- Raw CSV: scripts/google_maps_scraper/output/aircondition_aarhus.csv
- Validated CSV: scripts/google_maps_scraper/output/aircondition_aarhus.validated.csv

Summary:
- 30 raw Google Maps rows
- 24 rows had websites
- 11 valid or likely valid aircondition leads
- 7 uncertain
- 4 irrelevant
- 8 not checked or fetch failed

Top leads:
- Example Klima ApS: valid, installer_or_service_company, evidence: mentions "aircondition og komfortkøling" on /aircondition.
- Aarhus Varmepumper: likely_valid, retailer_or_dealer, evidence: product pages for luft til luft-varmepumper with cooling function.
```

## Safety And Compliance

- Respect rate limits and avoid repeated scrape retries.
- Do not collect personal/private data beyond business-level public information already visible on Google Maps or company websites.
- Do not extract or compile personal email addresses unless the user explicitly asks and the use is lawful; prefer business phone, website, and public company information.
- Make clear that results are a best-effort lead list, not a guaranteed complete market database.
