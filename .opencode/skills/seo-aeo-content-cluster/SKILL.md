---
name: seo-aeo-content-cluster
description: "Builds Danish topical authority maps and MDX article briefs for Indeklima Guiden, including SEO/AEO intent, component recommendations, FAQ ideas, and internal links for aircondition, varmepumper, indeklima, affugtere, and luftrensere. Activate when planning Danish content clusters or article roadmaps."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Content Cluster

## Overview

Builds Danish topical authority structures for Indeklima Guiden. Clusters should support aircondition, varmepumper, affugtere, luftrensere, ventilation-adjacent topics, strømforbrug, kapacitet/størrelse, installation, vedligeholdelse, product selection, and practical home-type decisions.

The output must be ready for this Astro/MDX site: each planned article should include target category, slug, schema type, recommended MDX components, FAQ questions, and internal link opportunities.

## When To Use This Skill

- Use when building topical authority around a Danish indoor climate topic.
- Use when planning article clusters for `aircondition`, `varmepumper`, or `indeklima`.
- Use when deciding which article to write next.
- Use when planning product reviews, comparisons, buyer guides, explainers, cost/energy articles, and how-to content.
- Use when identifying Danish AEO opportunities competitors are missing.

## Cluster Output Requirements

For every planned article, include:

- Priority: `P1`, `P2`, or `P3`.
- Working title in Danish.
- Primary keyword and 3–6 secondary keywords.
- Category: `aircondition`, `varmepumper`, or `indeklima`.
- Suggested slug.
- Content type: pillar, comparison, review, buyer guide, explainer, price guide, cost/energy, how-to, home-type guide, or problem/solution.
- Search intent: informational, commercial investigation, comparison, local/installer, troubleshooting, or mixed.
- Recommended `schemaType`: `Article`, `Review`, or `HowTo`.
- Recommended components: `AnswerBox`, `ComparisonTable`, `SpecCard`, `ProsCons`, `ExpertTip`, `DisclosureBox`.
- 4–6 FAQ question ideas for frontmatter.
- Internal links: pillar target, cluster links, category links, and conversion/future lead paths where relevant.
- AEO angle: direct answer, definition, verdict, comparison matrix, calculation, or checklist.

## Component Planning Rules

Plan components based on article intent:

- Explainer: `AnswerBox`, optionally `ComparisonTable`, `ExpertTip`.
- Product review: `DisclosureBox`, `AnswerBox title="Kort dom"`, `SpecCard`, `ProsCons`, optionally `ComparisonTable` for alternatives.
- Comparison: `AnswerBox title="Hurtig anbefaling"`, `ComparisonTable`, `ExpertTip`, optionally `SpecCard`.
- Buyer guide: `AnswerBox`, `SpecCard`, `ComparisonTable`, `ExpertTip`.
- Cost/energy article: `AnswerBox`, `SpecCard`, `ComparisonTable`, `ExpertTip`.
- Problem/solution article: `AnswerBox`, `ExpertTip`, optionally `ComparisonTable` if multiple solutions are compared.
- How-to article: `AnswerBox`, `ExpertTip`, `ComparisonTable` only if choosing between approaches.

Do not plan manual FAQ components. FAQ belongs in article frontmatter and is rendered by `ArticleLayout.astro`.

## Cluster Workflow

### Step 1: Define The Pillar Page

Set the Danish primary keyword, target audience, search intent, category, and word count target. Define whether the audience is homeowners, renters, apartment owners, villa owners, summer house owners, allergy sufferers, people with humidity problems, or users comparing specific units.

### Step 2: Generate Cluster Articles

Produce 8–15 subtopics sorted into priority tiers:

- `P1`: High search value, clear intent, high usefulness. Write first.
- `P2`: Medium volume, long-tail, supports topical depth. Write second.
- `P3`: Lower volume, high conversion or niche AEO intent. Write later.

Include a healthy mix:

- Product reviews.
- Comparisons by category, price, home type, noise level, energy use, or season.
- Buyer guides.
- Explainers.
- Cost/energy articles.
- Fit articles for apartment, villa, summer house, bedroom, basement, office, or small room.
- Maintenance/problem articles: filters, condensation, humidity, mold/skimmel risk, noise, placement, service.

### Step 3: Build Internal Link Map

Every cluster article must link back to the pillar page or category hub. No orphan articles. Map cluster-to-cluster links where intent naturally overlaps.

### Step 4: Identify AEO Gaps

Flag question-based Danish opportunities, especially:

- “hvor meget strøm bruger ...”
- “hvilken størrelse skal jeg vælge ...”
- “kan den bruges i lejlighed ...”
- “bedst til soveværelse ...”
- “luft til luft varmepumpe vs aircondition”
- “affugter eller luftrenser”
- “hvad koster ... i drift”

## Output Template

```md
## Cluster: [Pillar Keyword]

Pillar page:
- Title:
- Category:
- Slug:
- Intent:
- Recommended components:
- Internal links out:

### P1 Articles

1. [Title]
- Primary keyword:
- Secondary keywords:
- Category:
- Slug:
- Content type:
- Search intent:
- schemaType:
- Recommended components:
- AEO angle:
- FAQ ideas:
- Internal links:

### P2 Articles
...

### P3 Articles
...

### Link Map
- Pillar -> cluster:
- Cluster -> pillar:
- Cluster -> cluster:
- Category links:
```

## Best Practices

- Do assign every article a unique Danish target keyword.
- Do prevent cannibalisation between pillar, category, and cluster pages.
- Do plan components upfront so the writer can produce structured MDX quickly.
- Do include at least two AEO-heavy articles per cluster.
- Do include review, comparison, buying, and practical decision content, not only generic explainers.
- Do plan soft conversion paths toward future installers/contractors only where useful.
- Do not create orphan articles.
- Do not target the same keyword on both a pillar and a cluster article.

## Related Skills

- `@seo-aeo-blog-writer` writes the planned MDX articles.
- `@seo-aeo-internal-linking` turns the cluster into detailed link placements.
- `@seo-aeo-content-quality-auditor` audits article quality after writing.

## Limitations

- Use this skill only for Danish indoor climate content planning.
- Do not treat keyword plans as final search-volume data unless actual research is provided.
- Ask for clarification if the pillar topic or business priority is unclear.
