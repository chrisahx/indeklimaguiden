# Indeklima Guiden

Astro site for Danish guides, articles, calculators, and SEO/AEO content about aircondition, varmepumper, and indoor climate.

## Commands

Run commands from the project root.

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build production site to `dist/` and generate Pagefind index |
| `npm run build:astro` | Build Astro only |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |

When starting the dev server in this workspace, prefer:

```sh
astro dev --background
```

Manage it with `astro dev status`, `astro dev logs`, and `astro dev stop`.

## Google Maps Scraper CLI

The repository includes an unofficial Playwright-based Google Maps scraper in `scripts/google_maps_scraper/`.
It exports visible Google Maps business data to CSV. It does not visit company websites and does not scrape emails.

### Setup

Create and activate a Python virtual environment from the project root:

```sh
python -m venv .venv-google-maps-scraper
source .venv-google-maps-scraper/bin/activate
```

If you use `fish`, activate it with:

```fish
source .venv-google-maps-scraper/bin/activate.fish
```

Install dependencies and the Playwright browser:

```sh
pip install -r scripts/google_maps_scraper/requirements.txt
python -m playwright install chromium
```

### Required Parameters

| Parameter | Description |
| :-- | :-- |
| `--category` | Business category or search query, for example `Aircondition Forhandler` |
| `--country` | Country to scrape, for example `Denmark` |
| `--output` | CSV output path |

Minimal command:

```sh
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --output scripts/google_maps_scraper/output/aircondition_denmark.csv
```

### Recommended Test Run

Start with a small visible browser run before scraping more broadly:

```sh
python -m scripts.google_maps_scraper.cli \
  --category "Aircondition Forhandler" \
  --country "Denmark" \
  --city "Copenhagen" \
  --max-results 10 \
  --max-per-query 10 \
  --headed \
  --output scripts/google_maps_scraper/output/test.csv
```

### Common Options

| Option | Description |
| :-- | :-- |
| `--city "Copenhagen"` | Scrape one city only |
| `--max-results 100` | Stop after writing this many CSV rows |
| `--max-per-query 50` | Limit listings collected per city/query |
| `--headed` | Show Chromium while scraping |
| `--headless` | Run Chromium in the background |
| `--country-strategy city-list` | Use known cities for broader country coverage; default |
| `--country-strategy single-query` | Use one national Google Maps query |
| `--language en` | Google Maps UI language |
| `--delay-min 1 --delay-max 3` | Random delay range between business profile visits |
| `--verbose` | Enable debug logging |

For Denmark, the default `city-list` strategy searches major cities and deduplicates businesses in the CSV. This usually gives better national coverage than a single query like `Aircondition Forhandler Denmark`.

Unofficial Google Maps scraping can trigger captchas, throttling, or blocking. Use small limits first, keep delays conservative, and run with `--headed` when debugging.

## Company Enrichment Scraper

The repository also includes a batch enrichment scraper in `scripts/company_enrichment/` for varmepumpe installer company lists. It uses Playwright to scrape Google Maps and Trustpilot directly, then writes Astro-friendly JSON data.

Use the same Python environment and Playwright setup as the Google Maps scraper above.

### Input CSV

Default input path:

```text
data/input/varmepumpe-installatorer.csv
```

Supported columns include Danish and English names:

| Column | Notes |
| :-- | :-- |
| `id` | Optional stable company id; generated from name/city if missing |
| `name` or `navn` | Company name |
| `website`, `hjemmeside`, or `url` | Company website; used for Trustpilot domain verification |
| `city` or `by` | City, used for Google Maps matching |
| `address` or `adresse` | Address, used for Google Maps matching |
| `phone` or `telefon` | Optional phone number |
| `email` or `e-mail` | Optional email address |
| `contact` or `kontakt` | Optional combined contact field; phone and email are split automatically |
| `cvr` | Optional CVR number |

If the company name contains a CVR marker, for example `Example ApS CVR: 12345678`, the scraper removes the CVR part from `name` and stores the number in the separate `cvr` property.

Example CSV:

```csv
id,name,website,city,address,phone,cvr
nova-solar-aalborg,Nova Solar A/S,https://example.dk,Aalborg,Eksempelvej 1,+45 12345678,12345678
```

### Batch Scrape

Scrape the next 10 companies from the CSV:

```sh
python -m scripts.company_enrichment.cli \
  --input data/input/varmepumpe-installatorer.csv \
  --batch-size 10
```

The script saves after each company, so a failed run can be resumed safely by running the same command again.

### Update One Company

Update by company id:

```sh
python -m scripts.company_enrichment.cli \
  --company-id nova-solar-aalborg \
  --force
```

Update by name substring:

```sh
python -m scripts.company_enrichment.cli \
  --name "Nova Solar" \
  --force
```

### Source-Specific Runs

Only scrape Google Maps:

```sh
python -m scripts.company_enrichment.cli \
  --source google \
  --batch-size 10
```

Only scrape Trustpilot:

```sh
python -m scripts.company_enrichment.cli \
  --source trustpilot \
  --batch-size 10
```

Only re-import CSV fields without scraping Google Maps or Trustpilot:

```sh
python -m scripts.company_enrichment.cli \
  --input data/input/varmepumpe-installatorer.csv \
  --source input \
  --batch-size 1000
```

### Debug Run

Start with one visible browser run when testing selectors, captchas, or matching:

```sh
python -m scripts.company_enrichment.cli \
  --input data/input/varmepumpe-installatorer.csv \
  --batch-size 1 \
  --headed \
  --verbose
```

### Common Options

| Option | Description |
| :-- | :-- |
| `--batch-size 10` | Number of companies to process in this run; default is 10 |
| `--company-id ID` | Update one specific company |
| `--name "Name"` | Update the first company matching the name substring |
| `--source all` | Scrape Google Maps and Trustpilot; default |
| `--source google` | Scrape only Google Maps |
| `--source trustpilot` | Scrape only Trustpilot |
| `--source input` | Only import/normalize CSV fields without scraping external sources |
| `--force` | Re-scrape even if data already exists |
| `--stale-days 30` | Re-scrape source data older than this many days |
| `--max-google-reviews 100` | Maximum Google reviews per company; `0` means try all |
| `--max-trustpilot-reviews 100` | Maximum Trustpilot reviews per company; `0` means try all |
| `--google-candidate-limit 2` | Maximum Google Maps candidates to inspect per query |
| `--delay-min 5 --delay-max 15` | Random delay range between Google profile visits |
| `--headed` | Show Chromium while scraping |
| `--headless` | Run Chromium hidden; default |
| `--language da` | Google Maps UI language; default is Danish |
| `--verbose` | Enable debug logging |

### Outputs

The default output directory is `data/companies/`.

```text
data/companies/companies.json
data/companies/scrape-state.json
data/companies/reviews/google-reviews.jsonl
data/companies/reviews/trustpilot-reviews.jsonl
data/companies/raw/google/{company_id}.json
data/companies/raw/trustpilot/{company_id}.json
```

`companies.json` is the main company index for Astro. Review files are JSONL, with one review per line linked to the company through `company_id`.

The script replaces old reviews for the same `company_id` and source when updating a company, so repeated runs do not append duplicate reviews for that company.

### What It Scrapes

Google Maps data includes best-effort extraction of name, category, phone, website, address, rating, review count, opening hours, description, latitude/longitude, Google Maps URL, image URLs, and reviews.

If Google Maps contact text contains both phone and email, the scraper stores them separately as `phone` and `email`. The full parsed contact data is also stored under `google.contact` with `phones` and `emails` arrays when available.

Trustpilot data includes best-effort extraction of profile URL, domain, rating, review count, domain verification status, and reviews.

Trustpilot matches are verified against the company website domain when possible. If the domain cannot be confidently verified, inspect the output before publishing the data.

Google Maps and Trustpilot markup changes often. Keep batches small, use conservative delays, and debug with `--headed` if fields start coming back empty.

## Project Structure

```text
src/
├── components/        Shared Astro components
├── content/articles/  MDX articles
├── layouts/           Page/article layouts
├── lib/               SEO, constants, structured data, article helpers
├── pages/             Astro routes
└── styles/            Global CSS
```

Important routes:

| Route | File |
| :-- | :-- |
| `/` | `src/pages/index.astro` |
| `/aircondition/` | `src/pages/aircondition/index.astro` |
| `/varmepumper/` | `src/pages/varmepumper/index.astro` |
| `/indeklima/` | `src/pages/indeklima/index.astro` |
| `/beregnere/` | `src/pages/beregnere/index.astro` |
| `/beregnere/aircondition-varmepumpe-stoerrelse/` | `src/pages/beregnere/aircondition-varmepumpe-stoerrelse.astro` |

## Google AdSense

The site uses manual AdSense placements through `src/components/GoogleAd.astro`.
Article ad placement is centralized in `src/layouts/ArticleLayout.astro`, and calculator ad placement is centralized in `src/layouts/CalculatorLayout.astro`.

In development, ad positions render visible `Annonce` placeholders even without AdSense configuration. In production, ad positions render only when both the AdSense client and the relevant slot ID are configured.

### Required Client ID

Set this to your Google AdSense publisher client ID:

```sh
PUBLIC_GOOGLE_ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"
```

This loads the AdSense script in `src/layouts/BaseLayout.astro`:

```html
https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX
```

### Calculator Ad Slots

These control shared ad placements on calculator pages using `src/layouts/CalculatorLayout.astro`.

| Env var | Placement |
| :-- | :-- |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_SIDEBAR` | Ad beside the calculator form/result on desktop |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_WIDE` | Wide ad between calculator and article content |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_ARTICLE` | In-content ad inside the calculator article content |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_MOBILE_1` | Mobile-only in-content ad near the start of the calculator article content |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_MOBILE_2` | Mobile-only in-content ad later in the calculator article content |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_LEFT_RAIL` | Left rail ad beside calculator article content on desktop |
| `PUBLIC_ADSENSE_SLOT_CALCULATOR_RIGHT_RAIL` | Right rail ad beside calculator article content on desktop |

### Article Ad Slots

These control ad placements for MDX article pages using `src/layouts/ArticleLayout.astro`.

| Env var | Placement |
| :-- | :-- |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_TOP` | Wide ad after the article hero/meta area |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_IN_CONTENT` | In-content ad before the FAQ section |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_MOBILE_1` | Mobile-only in-content ad before the article body |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_MOBILE_2` | Mobile-only in-content ad after the article body |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM` | Wide ad after the article body |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_LEFT_RAIL` | Left rail ad beside article content on desktop |
| `PUBLIC_ADSENSE_SLOT_ARTICLE_RIGHT_RAIL` | Right rail ad beside article content on desktop |

### Example `.env`

```sh
PUBLIC_GOOGLE_ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"

PUBLIC_ADSENSE_SLOT_CALCULATOR_SIDEBAR="1111111111"
PUBLIC_ADSENSE_SLOT_CALCULATOR_WIDE="2222222222"
PUBLIC_ADSENSE_SLOT_CALCULATOR_ARTICLE="3333333333"
PUBLIC_ADSENSE_SLOT_CALCULATOR_MOBILE_1="4444444444"
PUBLIC_ADSENSE_SLOT_CALCULATOR_MOBILE_2="5555555555"
PUBLIC_ADSENSE_SLOT_CALCULATOR_LEFT_RAIL="6666666666"
PUBLIC_ADSENSE_SLOT_CALCULATOR_RIGHT_RAIL="7777777777"

PUBLIC_ADSENSE_SLOT_ARTICLE_TOP="8888888888"
PUBLIC_ADSENSE_SLOT_ARTICLE_IN_CONTENT="9999999999"
PUBLIC_ADSENSE_SLOT_ARTICLE_MOBILE_1="0000000000"
PUBLIC_ADSENSE_SLOT_ARTICLE_MOBILE_2="1111111112"
PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM="2222222223"
PUBLIC_ADSENSE_SLOT_ARTICLE_LEFT_RAIL="3333333334"
PUBLIC_ADSENSE_SLOT_ARTICLE_RIGHT_RAIL="4444444445"
```

### How To Enable Google Ads

1. Create or open your site in Google AdSense.
2. Get your publisher client ID, formatted like `ca-pub-XXXXXXXXXXXXXXXX`.
3. Create ad units in AdSense for the placements you want to use.
4. Copy each ad unit slot ID into the matching env var.
5. Add the env vars to your hosting provider.
6. Deploy a production build.
7. Confirm that AdSense has approved the domain and that ads are allowed to serve.

Only configured slots render in production. If an env var is missing, that placement is omitted from the HTML.

## Notes

Rail ads are desktop-only and hidden on smaller screens. Use the `*_MOBILE_1` and `*_MOBILE_2` slots for mobile-only in-content ads so mobile pages still have ad inventory without crowding the layout.




## ARTICLES TODO

### Aircondition (10)
- [ ] Bedste mobile aircondition
- [x] Aircondition prisguide
- [ ] Bedste Aircondition til soveværelse
- [ ] Bedste Aircondition til lejlighed
- [x] Aircondition strømforbrug
- [x] Aircondition installation
- [x] Aircondition uden aftræk
- [x] Kan man sove med aircondition?
- [x] Aircondition vs ventilator
- [ ] Bedste Aircondition til hus
- [ ] Bedste mini aircondition 
- [ ] Bedste mobile aircondition 
- [x] klimaanlæg vs aircondition
- [ ] Bedste klimanlæg til hus
- [ ] Aircondition service

### Varmepumper (10)
- [ ] Bedste luft til luft varmepumpe
- [ ] Luft til luft varmepumpe pris
- [ ] Luft til vand varmepumpe pris
- [x] Varmepumpe strømforbrug
- [ ] Varmepumpe til sommerhus
- [ ] Varmepumpe test
- [ ] Hvilken varmepumpe skal jeg vælge?
- [x] Luft til luft vs luft til vand
- [x] Tilskud til varmepumpe
- [x] Installation af varmepumpe

### Indeklima (10)
- [x] Optimal luftfugtighed i hjemmet
- [x] Sådan måler du luftkvalitet
- [ ] Bedste affugter
- [ ] Bedste luftrenser
- [x] Dårligt indeklima symptomer
- [x] Hvorfor dugger vinduer?
- [x] Fugt i soveværelse
- [x] Ventilation i hus
- [x] Genvindingsanlæg guide
- [x] Sådan forbedrer du indeklimaet


```
jeg vil gerne have at du researcher følgende emne: "Dårligt indeklima symptomer". målet med din research er til at skrive en blog artikel til en hjemmeside omrking varmepumper / airconditions / affugtere
Hvis du har eksterne links i forhold til gode resourcer så skriv gerne de fulde clean links
```


google page index next page --> https://indeklimaguiden.dk/indeklima/fugt-i-sovevaerelse/
