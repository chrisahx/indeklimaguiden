---
name: seo-aeo-blog-writer
description: "Writes Danish MDX blog articles, product reviews, comparisons, and buyer guides for Indeklima Guiden using AnswerBox, ComparisonTable, SpecCard, ProsCons, ExpertTip, DisclosureBox, frontmatter FAQ, SEO, and AEO. Activate when the user wants to write or update a Danish article, review, comparison, or guide."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Blog Writer

## Overview

Writes structured Danish long-form MDX content for Indeklima Guiden. The site covers aircondition, varmepumper, affugtere, luftrensere, strømforbrug, størrelse/kapacitet, installation, boligtyper, and practical indeklimaproblemer for Danish readers.

Every article must serve both SEO ranking and AEO citation: clear search intent, direct answers, extractable facts, Danish long-tail questions, practical tradeoffs, and useful buyer guidance. Avoid generic AI copy. Write like a practical Danish review/guide site for 2026.

## When To Use This Skill

- Use when writing a Danish article under `src/content/articles/**`.
- Use when creating a product review, comparison, buyer guide, explainer, price guide, or how-to article.
- Use when explaining electricity use, noise, capacity, cooling/heating performance, humidity control, filters, installation, maintenance, or Danish climate considerations.
- Use when the article should use the project article components: `AnswerBox`, `ComparisonTable`, `SpecCard`, `ProsCons`, `ExpertTip`, or `DisclosureBox`.
- Use when content must be scannable by users and extractable by AI answer engines.

## Article File Structure

Create articles under:

```text
src/content/articles/{category}/{slug}.mdx
```

Allowed categories:

- `aircondition`
- `varmepumper`
- `indeklima`

Use Danish slugs, concise titles, and the frontmatter schema from `src/content.config.ts`.

```yaml
---
title: "Dansk H1"
seoTitle: "SEO title under ca. 60 characters"
description: "Kort artikelbeskrivelse til kort og intro."
seoDescription: "Meta description under ca. 155 characters."
pubDate: 2026-06-25
updatedDate: 2026-06-25
category: "aircondition"
slug: "dansk-url-slug"
tags: ["aircondition", "strømforbrug"]
draft: true
featured: false
commercialDisclosure: true
schemaType: "Article"
faq:
  - question: "Kort dansk long-tail spørgsmål?"
    answer: "Selvstændigt svar under 50 ord."
---
```

Schema guidance:

- Use `schemaType: "Article"` for explainers, price guides, buyer guides, comparisons, and general advice.
- Use `schemaType: "Review"` for real product reviews with a verdict.
- Use `schemaType: "HowTo"` only for procedural step-by-step guides.
- Put FAQ entries in frontmatter. Do not import or manually render `FAQ.astro` in MDX articles.

## Available MDX Components

Articles are nested one folder below the category, so import components like this:

```mdx
import AnswerBox from '../../../components/AnswerBox.astro';
import ComparisonTable from '../../../components/ComparisonTable.astro';
import DisclosureBox from '../../../components/DisclosureBox.astro';
import ExpertTip from '../../../components/ExpertTip.astro';
import ProsCons from '../../../components/ProsCons.astro';
import SpecCard from '../../../components/SpecCard.astro';
```

Component usage:

- `AnswerBox`: Use near the top for the direct answer, short verdict, or recommendation. Optional prop: `title="Kort svar"`, `title="Kort dom"`, `title="Hurtig anbefaling"`, or `title="Konklusion"`.
- `DisclosureBox`: Use for draft caveats, commercial transparency, affiliate context, or data limitations. Also set `commercialDisclosure: true` when commercially relevant.
- `ExpertTip`: Use for practical Danish advice, assumptions, caveats, installation warnings, electricity-use calculations, or mistakes to avoid.
- `SpecCard`: Use in a `.spec-grid` for key specs, price components, dB, kWh, BTU/kW, m2 coverage, installation type, maintenance, or use cases.
- `ProsCons`: Use for product reviews, technology comparisons, buying decisions, and “er det det værd?” sections.
- `ComparisonTable`: Use for products, technologies, price components, home types, running costs, features, or decision matrices.

## Recommended Component Mix

- Explainer: `AnswerBox` → definition H2 → practical sections → `ExpertTip` → `ComparisonTable` if options are compared → frontmatter FAQ.
- Product review: `DisclosureBox` when relevant → `AnswerBox title="Kort dom"` → `SpecCard` grid → `ProsCons` → performance/noise/economy → alternatives → frontmatter FAQ.
- Comparison: `AnswerBox title="Hurtig anbefaling"` → `ComparisonTable` early → best-by-use-case sections → `ExpertTip` caveats → frontmatter FAQ.
- Buyer guide: `AnswerBox` → buying criteria → `SpecCard` grid → `ComparisonTable` → mistakes to avoid with `ExpertTip` → frontmatter FAQ.
- Cost/energy article: `AnswerBox` → cost components with `SpecCard` → calculation example → `ComparisonTable` → `ExpertTip` for assumptions → frontmatter FAQ.

## Standard Writing Workflow

1. Identify the primary Danish keyword, secondary keywords, target reader, and search intent.
2. Write the frontmatter before the body, including 4–6 FAQ entries.
3. Import only the components the article actually uses.
4. Start with `AnswerBox` containing a 2–3 sentence direct answer.
5. Build a clean H2/H3 skeleton before writing body text.
6. Add tables/cards where they make the article easier to scan, not as decoration.
7. Add internal links naturally to relevant category pages and related articles.
8. End with a concise conclusion or decision summary.

## MDX Examples

### Direct Answer

```mdx
<AnswerBox title="Kort svar">
  En mobil aircondition giver bedst mening, hvis du har behov for fleksibel køling i få rum og kan føre varm luft ud gennem vindue eller dør. Til fast, støjsvag køling i større boliger bør en installeret løsning ofte vurderes i stedet.
</AnswerBox>
```

### Comparison Table

```mdx
<ComparisonTable
  headers={["Løsning", "Bedst til", "Vigtig ulempe"]}
  rows={[
    ["Mobil aircondition", "Lejlighed og midlertidig køling", "Kræver aftræk og kan støje"],
    ["Luft til luft-varmepumpe", "Helårsbrug og fast installation", "Kræver professionel montering"],
  ]}
/>
```

### Pros And Cons

```mdx
<ProsCons
  pros={["Fleksibel placering", "Kan køle hurtigt i mindre rum"]}
  cons={["Aftræksslange skal placeres korrekt", "Støj kan være et problem om natten"]}
/>
```

### Spec Grid

```mdx
<div class="spec-grid">
  <SpecCard label="Rumstørrelse" value="Op til 25 m2" note="Afhænger af sol, isolering og loftshøjde." />
  <SpecCard label="Støj" value="Ca. 50-65 dB" note="Kontroller altid laveste nattilstand." />
  <SpecCard label="Drift" value="Afhænger af brug" note="Beregn ud fra watt, timer og elpris." />
</div>
```

If `.spec-grid` is used, include this local style at the bottom of the article:

```mdx
<style>{`
  .spec-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  @media (max-width: 760px) {
    .spec-grid { grid-template-columns: 1fr; }
  }
`}</style>
```

### FAQ Frontmatter

```yaml
faq:
  - question: "Hvor meget strøm bruger en mobil aircondition?"
    answer: "Strømforbruget afhænger af watt, driftstimer, rumstørrelse og temperaturforskel. Beregn typisk forbruget som watt divideret med 1000 ganget med antal timer."
  - question: "Kan en mobil aircondition bruges i en lejlighed?"
    answer: "Ja, hvis der er mulighed for at føre varm luft ud gennem vindue, altandør eller en egnet ventilationsløsning. Støj og aftræk er de vigtigste begrænsninger."
```

## SEO And AEO Requirements

- Use one primary Danish keyword per article and avoid cannibalising existing slugs.
- Put the primary keyword naturally in `title`, `seoTitle`, `description` or `seoDescription`, first body section, and at least one H2 when it reads naturally.
- Use Danish search language: “bedste”, “pris”, “strømforbrug”, “hvor meget”, “til lejlighed”, “til soveværelse”, “støjniveau”, “hvilken størrelse”.
- Keep FAQ answers under 50 words and self-contained.
- Include concrete Danish context: apartments, villas, summer houses, basements, electricity prices, winter/summer use, noise at night, and installation constraints.
- Use cautious claims for savings, health, mold/skimmel, allergy, and performance.
- Prefer practical recommendations over neutral manufacturer-style descriptions.

## Best Practices

- Do write natural Danish for homeowners, renters, apartment owners, and summer house owners.
- Do use components to improve clarity and extraction, not just visual variety.
- Do include concrete criteria: m2 coverage, BTU/kW, kWh, dB, installation type, filters, affugtning, maintenance, and use case.
- Do mention when professional installation or contractor help may be needed, without making unsupported legal claims.
- Do add internal links where they genuinely help the reader continue.
- Do not use generic blockquotes for the main answer; use `AnswerBox`.
- Do not write FAQ sections manually in the MDX body.
- Do not overstate savings, health effects, or performance without caveats.
- Do not skip a comparison table when comparing units, technologies, or buying options.

## Related Skills

- `@seo-aeo-content-cluster` provides topic maps and article briefs.
- `@seo-aeo-content-quality-auditor` audits finished articles.
- `@seo-aeo-internal-linking` maps links between this article and related pages.

## Limitations

- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for expert technical, legal, or installation advice.
- Stop and ask for clarification if the target keyword, category, or article intent is unclear.
