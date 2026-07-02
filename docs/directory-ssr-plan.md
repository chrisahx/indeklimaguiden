# Directory SSR Plan

## Goal

Add a company directory for Danish varmepumpe installers while keeping the existing editorial site prerendered and fast.

## Rendering Approach

1. Keep Astro's default static output for articles, guides, calculators, and current pages.
2. Use the Astro Node adapter for on-demand routes.
3. Mark only dynamic directory pages with `export const prerender = false` when they are added, for example:
   - `src/pages/installatoerer/index.astro`
   - `src/pages/installatoerer/[slug].astro`
   - future claim/sign-in endpoints
4. Run production through the Astro standalone Node server instead of nginx-only static hosting.

## Database Approach

1. Use PostgreSQL locally through `docker-compose.yml`.
2. Use `db/schema.sql` as the initial schema.
3. Keep stable public company fields normalized in `companies` and `company_locations`.
4. Store source-specific Google/Trustpilot snapshots in `company_sources.payload` as `jsonb`.
5. Store reviews in `company_reviews`, keyed by scraper-generated review IDs.
6. Keep claim/edit workflow tables separate from scraped data so business owners do not overwrite raw source data directly.

## Scraper Approach

The scraper should not run during Astro page requests. It should run as a separate batch job and upsert into PostgreSQL after scraping.

Recommended flow:

1. Scrape Google Maps and Trustpilot in small batches.
2. Save raw JSON/JSONL files as audit/debug artifacts.
3. Normalize and upsert companies, source snapshots, photos, and reviews into PostgreSQL.
4. SSR directory pages read from PostgreSQL.
5. Future business-owner edits create `company_edit_requests` first, then an approved change updates public fields.

This avoids slow page requests, scraper rate-limit failures, and accidental data loss from source-specific changes.

## Next Implementation Steps

1. Add a database helper in `src/lib/db.ts` using `DATABASE_URL`.
2. Add an ingestion command for `scripts/company_enrichment` that upserts existing `companies.json` and review JSONL files into PostgreSQL.
3. Build `/installatoerer` and `/installatoerer/[slug]` as SSR pages.
4. Add filters for city, rating, and source availability.
5. Add claim request pages once authentication is chosen.
