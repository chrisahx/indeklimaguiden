---
name: seo-aeo-internal-linking
description: "Maps Danish internal links for Indeklima Guiden MDX articles, category hubs, pillar pages, reviews, comparisons, and buyer guides with anchor text, placement context, component-aware link suggestions, orphan detection, and cannibalization checks. Activate when building or auditing internal links."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Internal Linking

## Overview

Analyses Danish indoor climate pages and MDX articles to produce internal link opportunities with exact Danish anchor text, placement instructions, orphan detection, anchor cannibalization warnings, and a link equity map.

This skill understands the Indeklima Guiden article structure: category hubs at `/aircondition/`, `/varmepumper/`, `/indeklima/`; MDX articles under `src/content/articles/{category}/`; and article components such as `AnswerBox`, `ComparisonTable`, `SpecCard`, `ProsCons`, `ExpertTip`, and `DisclosureBox`.

## When To Use This Skill

- Use when adding links to a new Danish MDX article.
- Use when building links between category hubs, pillar pages, and cluster articles.
- Use when connecting reviews to comparisons and buyer guides.
- Use when linking practical guides about electricity use, sizing, installation, humidity, air quality, and home type.
- Use when auditing the site for orphan pages or weak topical connections.
- Use after `@seo-aeo-content-cluster` creates a topic map.

## Link Targets In This Project

Use these core category hubs when relevant:

- `/aircondition/` for aircondition, mobile cooling, BTU, aftræk, støj, and cooling choices.
- `/varmepumper/` for luft til luft-varmepumper, price, installation, heating/cooling, and running economy.
- `/indeklima/` for luftfugtighed, ventilation, luftkvalitet, affugtere, luftrensere, skimmel risk, and general comfort.

Article URLs are generated from frontmatter as:

```text
/{category}/{slug}/
```

## Component-Aware Link Placement

Suggest internal links where they help the reader naturally:

- `AnswerBox`: Avoid stuffing links into the direct answer unless the link is essential. The answer should remain extractable and clean.
- First body section: Strong place for one contextual category or pillar link.
- `ComparisonTable`: Good for linking compared options only if the table text stays readable. Prefer links in adjacent prose if table cells become cluttered.
- `SpecCard`: Avoid links inside dense spec values. Use nearby explanatory text instead.
- `ProsCons`: Usually avoid links inside list items unless the link clarifies an alternative.
- `ExpertTip`: Good for linking to deeper caveat articles, installation guides, or calculation articles.
- FAQ: Do not rely on frontmatter FAQ for primary internal links. FAQ answers are rendered from frontmatter and should stay short and self-contained.

## Workflow

### Step 1: Detect Orphan Pages

Flag any article or category page with zero incoming internal links. Prioritise links from category hubs, pillar articles, and high-traffic guides.

### Step 2: Build Semantic Overlap Matrix

Match pages by:

- Category.
- Primary keyword.
- Search intent.
- Product type.
- Home type.
- Problem/solution relationship.
- Stage in buyer journey.

Strong link patterns:

- Category hub → priority cluster article.
- Cluster article → category hub.
- Pillar → cluster.
- Cluster → pillar.
- Review → comparison.
- Comparison → buyer guide.
- Cost article → product/category guide.
- Problem article → solution/buyer guide.
- Installation/caveat article → future contractor/installer path when relevant.

### Step 3: Assign Link Types

Use one of these labels:

- Category → Article.
- Article → Category.
- Pillar → Cluster.
- Cluster → Pillar.
- Cluster → Cluster.
- Review → Comparison.
- Comparison → Buyer Guide.
- Problem → Solution.
- Contextual Boost.
- Guide → Future Lead Page.

### Step 4: Write Danish Anchor And Context

For every opportunity, provide:

- Source page.
- Target page.
- Link type.
- Exact Danish anchor text.
- Placement: heading/section/component area.
- Full Danish context sentence.
- Reason/impact.

Good anchors are descriptive and natural:

- “bedste mobile aircondition”
- “hvor meget strøm en mobil aircondition bruger”
- “luft til luft-varmepumpe pris”
- “optimal luftfugtighed i hjemmet”
- “aircondition til soveværelse”
- “affugter til kælder”
- “luftrenser mod støv og pollen”

Avoid:

- “klik her”
- “læs mere”
- “se mere”
- repeated exact-match anchors to the same URL across many pages

### Step 5: Check Cannibalization

Flag when:

- Two pages target nearly identical primary keywords.
- The same exact-match anchor points to different pages.
- The same target receives the exact same anchor too often.
- A category page and article compete for the same query.

## Output Template

```md
# Internal Link Map

## Orphan Pages
- [URL] — Fix: [source page and anchor]

## High Priority Links
1. Source:
   Target:
   Type:
   Anchor:
   Placement:
   Context sentence:
   Impact:

## Medium Priority Links
...

## Component-Aware Notes
- Avoid linking inside:
- Best placement:

## Anchor Cannibalization Warnings
- Anchor:
- Problem:
- Fix:

## Link Equity Map
- Category hub:
- Pillar:
- Supporting articles:
```

## Best Practices

- Every article should link to its category hub or relevant pillar.
- Category hubs should link to the most important P1 articles.
- Product reviews should link to comparisons, buyer guides, and relevant category hubs.
- Informational articles should link toward practical next-step guides when useful.
- Use varied anchors: exact, partial, descriptive, and natural Danish.
- Place links in body prose where they help the reader, not just for SEO.
- Keep `AnswerBox` concise and mostly link-free.
- Do not overload frontmatter FAQ answers with internal links.
- Do not push lead-generation links aggressively in informational articles.
- Do not add more than necessary; quality beats link volume.

## Related Skills

- `@seo-aeo-content-cluster` creates the cluster map this skill links together.
- `@seo-aeo-blog-writer` writes or updates articles with the suggested links.
- `@seo-aeo-content-quality-auditor` audits link quality and article readiness.

## Limitations

- Use this skill only for Danish indoor climate internal linking.
- Do not invent existing article URLs if the site structure is available; inspect content files when possible.
- Ask for clarification if the target pillar, article priority, or conversion path is unclear.
