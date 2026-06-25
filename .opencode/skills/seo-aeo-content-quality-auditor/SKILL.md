---
name: seo-aeo-content-quality-auditor
description: "Audits Danish Indeklima Guiden MDX articles for SEO, AEO, usefulness, trust, frontmatter, schema, FAQ, internal links, and correct use of AnswerBox, ComparisonTable, SpecCard, ProsCons, ExpertTip, and DisclosureBox. Activate when reviewing Danish indoor climate articles before publishing."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Content Quality Auditor

## Overview

Audits Danish Indeklima Guiden landing pages and MDX articles for SEO, AEO, usefulness, trust, readability, component structure, and publishing readiness. Produces scored reports with severity-ranked fixes and exact recommendations.

This skill understands the project article system: MDX articles under `src/content/articles/{category}/{slug}.mdx`, frontmatter FAQ, `ArticleLayout.astro`, and article components such as `AnswerBox`, `ComparisonTable`, `SpecCard`, `ProsCons`, `ExpertTip`, and `DisclosureBox`.

## When To Use This Skill

- Use when auditing a Danish article before publishing.
- Use when reviewing product reviews, comparison articles, buyer guides, price guides, and technical explainers.
- Use after `@seo-aeo-blog-writer` creates or updates an article.
- Use when checking whether an article uses the project components correctly.
- Use when diagnosing why content is weak for search or AI answer extraction.

## Scoring System

Score each area out of 100:

- SEO score.
- AEO score.
- Usefulness/trust score.
- Readability score.
- MDX/component score.
- Overall score.

Labels:

| Score | Status | Label |
|---|---|---|
| 85-100 | Pass | Strong |
| 70-84 | Warn | Acceptable |
| 50-69 | Weak | Needs work |
| 0-49 | Fail | Do not publish |

Issue severities:

- Critical: Fix before publishing.
- Important: Fix soon.
- Polish: Optional improvement.

## Audit Workflow

### Step 1: Frontmatter And Schema Checks

Verify the article frontmatter matches `src/content.config.ts`:

- `title` present and clear.
- `seoTitle` present and concise.
- `description` present and useful for article cards.
- `seoDescription` present and search-friendly.
- `pubDate` valid.
- `updatedDate` added when article is materially updated.
- `category` is one of `aircondition`, `varmepumper`, or `indeklima`.
- `slug` matches the intended URL and does not cannibalise another slug.
- `tags` are useful and not stuffed.
- `draft` is intentional.
- `featured` is intentional.
- `commercialDisclosure` matches article context.
- `schemaType` is appropriate: `Article`, `Review`, or `HowTo`.
- `faq` has 4–6 useful questions for publish-ready articles unless the article is intentionally short.

### Step 2: SEO Checks

Verify:

- One clear primary Danish keyword.
- Search intent is matched in title, intro, headings, and content depth.
- H1/H2/H3 structure is logical and non-duplicative.
- The article does not cannibalise existing category or article pages.
- Primary and secondary terms appear naturally.
- Meta title and description can win clicks.
- Internal links support topical authority.
- Content includes Danish context: boligtype, m2, støj, strømforbrug, installation, årstid, or use case where relevant.

### Step 3: AEO Checks

Verify:

- The article has an `AnswerBox` near the top with a 2–3 sentence direct answer.
- The direct answer can stand alone without context.
- Reviews include a clear verdict.
- Explainers include a clean definition sentence.
- Comparisons include a clear recommendation or decision rule.
- FAQ frontmatter answers are under 50 words and self-contained.
- Tables/cards make facts extractable.
- Lists and headings answer natural Danish questions.

### Step 4: Component Checks

Audit correct component usage:

- `AnswerBox`: Required for most articles. Should appear near the top, before the first deep body section.
- `ComparisonTable`: Required when comparing products, technologies, costs, options, scenarios, or buying choices.
- `SpecCard`: Expected for specs, price components, dB, kWh, BTU/kW, m2 coverage, installation type, or core criteria.
- `ProsCons`: Expected for product reviews and useful for comparisons or decision articles.
- `ExpertTip`: Useful for caveats, calculations, installation warnings, maintenance, and mistakes to avoid.
- `DisclosureBox`: Required when there are draft caveats, affiliate/commercial context, or unverified prices/specs. If used for commercial context, `commercialDisclosure: true` should normally be set.
- `FAQ.astro`: Should not be imported manually in MDX articles. FAQ comes from frontmatter.

Also verify imports use the correct relative path from article MDX files:

```mdx
import AnswerBox from '../../../components/AnswerBox.astro';
```

If `.spec-grid` is used, verify the article includes responsive local styling or an equivalent reusable style.

### Step 5: Usefulness And Trust Checks

Verify:

- The article gives practical Danish buying help, not generic product copy.
- Claims about savings, health, mold/skimmel, allergy, air quality, and performance are cautious.
- Electricity calculations explain assumptions.
- Installation advice avoids unsupported legal/technical claims.
- The reader can decide what to do next.
- Commercial transparency is clear where relevant.

### Step 6: Readability Checks

Verify:

- Natural Danish.
- Short paragraphs.
- Good subheading frequency.
- Technical terms like BTU, kW, kWh, COP/SCOP, HEPA, affugtning, dB, and m2 are explained when introduced.
- No wall-of-text sections.
- Components improve scanability without making the article feel cluttered.

## Output Template

```md
# Audit: [Article Title]

Overall score: __/100
SEO score: __/100
AEO score: __/100
Usefulness/trust: __/100
Readability: __/100
MDX/component score: __/100

Verdict: [Publish / Fix before publishing / Major rewrite]

## Critical
- [Issue]
  Fix: [Exact change]

## Important
- [Issue]
  Fix: [Exact change]

## Polish
- [Issue]
  Fix: [Exact change]

## Component Recommendations
- Add/remove/change: [component]
- Placement: [where in article]

## FAQ Recommendations
- Add:
- Rewrite:

## Internal Link Recommendations
- Source section:
- Target:
- Anchor text:

Projected score after fixes: __/100
```

## Common Critical Issues

- No `AnswerBox` near the top.
- FAQ is written in the body instead of frontmatter.
- FAQ answers are too long or context-dependent.
- Comparison article lacks `ComparisonTable`.
- Review lacks verdict, specs, or `ProsCons`.
- Price/energy claims lack assumptions or caveats.
- Commercial article lacks transparency.
- Category/slug does not match the content topic.
- Article is generic and not clearly written for Danish homes.

## Best Practices

- Fix all Critical issues before publishing.
- Prefer exact MDX fixes over generic advice.
- Treat component structure as part of AEO, not only design.
- Preserve good article content; do not force components where plain prose is clearer.
- Keep the audit actionable and severity-ranked.

## Related Skills

- `@seo-aeo-blog-writer` writes or updates the MDX article.
- `@seo-aeo-content-cluster` provides topic and intent context.
- `@seo-aeo-internal-linking` improves internal links and topical authority.

## Limitations

- Use this skill only when the task matches Danish indoor climate content auditing.
- Do not treat the score as a substitute for factual verification of prices, specs, safety, or installation rules.
- Ask for clarification if the article goal, keyword, or publishing state is unclear.
