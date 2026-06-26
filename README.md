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

These control ad placements on `/beregnere/aircondition-varmepumpe-stoerrelse/`.

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
- [ ] Aircondition til soveværelse
- [ ] Aircondition til lejlighed
- [ ] Aircondition strømforbrug
- [x] Aircondition installation
- [x] Aircondition uden aftræk
- [x] Kan man sove med aircondition?
- [ ] Aircondition vs ventilator
- [ ] Aircondition til hus

**mulige første artikler fra ahref**
- [ ] mini aircondition 
- [ ] aircondition til hus
- [ ] aircondition til lejlighed
- [ ] klimaanlæg vs aircondition
- [ ] klimanlæg til hus

- [ ] mobil aircondition
- [ ] aircondition til soveværelse
- [ ] aircondition service

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
