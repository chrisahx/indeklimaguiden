---
name: seo-aeo-internal-linking
description: "Maps Danish internal link opportunities between indoor climate pages, product reviews, comparisons, buyer guides, pillar pages, and future lead-generation pages with anchor text, placement instructions, orphan detection, and cannibalization checks. Activate when the user wants to build an internal linking strategy or find link opportunities."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Internal Linking

## Overview

Analyses a set of Danish indoor climate pages and produces a prioritised list of internal link opportunities with exact Danish anchor text, a context sentence showing where each link should appear, orphan page detection, anchor text cannibalization warnings, and a link equity map showing how authority flows across the content.

The linking model should support product reviews, comparison pages, buyer guides, explainers, cost/energy articles, home-type guides, and future lead-generation pages for contractors/installers.

Part of the [SEO-AEO Engine](https://github.com/mrprewsh/seo-aeo-engine).

## When to Use This Skill

- Use when building internal links between a new Danish pillar page and its cluster articles
- Use when connecting product reviews to comparison pages and buyer guides
- Use when linking practical guides about electricity use, sizing, installation, humidity, air quality, and home type
- Use when auditing an existing site for orphan pages
- Use after content-cluster generates a topic map
- Use when preparing conversion paths toward future lead-generation pages for relevant contractors/installers
- Use when you need anchor text suggestions with placement context

## How It Works

### Step 1: Detect Orphan Pages
Flag any page with zero incoming internal links. These are invisible to search engines and must be linked immediately.

### Step 2: Build Semantic Overlap Matrix
Match pages by Danish primary keyword similarity, user intent, product type, home type, and content summary to identify natural linking opportunities. Strong semantic links include review → comparison, comparison → buyer guide, guide → product category, problem article → solution article, and informational article → future contractor/installer page where relevant.

### Step 3: Assign Link Types
Every suggestion gets one of four labels:
- **Cluster → Pillar** — highest priority, consolidates authority upward
- **Pillar → Cluster** — distributes authority downward
- **Cluster → Cluster** — builds semantic depth
- **Contextual Boost** — concentrates equity on a focus page
- **Review → Comparison** — helps users compare alternatives after reading a unit review
- **Guide → Lead Page** — supports future lead generation when the user likely needs professional help

### Step 4: Write Context Sentences
For every link opportunity, write the Danish sentence the anchor text should appear in — naturally placed, not forced. Anchors should match Danish search language, such as "bedste aircondition til soveværelse", "hvor meget strøm bruger en varmepumpe", "affugter til kælder", or "luft til luft varmepumpe til sommerhus".

### Step 5: Check Anchor Text
Flag any exact-match anchor used more than once for the same target page as a cannibalization risk. Avoid generic anchors like "klik her", "læs mere", and "se mere" when the anchor can describe the destination more clearly.

## Examples

### Example: Link Opportunity Output
🔴 High Priority — Link 1
Type: Cluster → Pillar
Source: "How to Build a Budget That Actually Works"
Target: "The Complete Guide to Automated Budgeting"
Anchor: "automated budgeting guide"
Context: "For a full breakdown of every method available,
see our [automated budgeting guide]."
Impact: Consolidates topical authority on pillar page.
Orphan Alert:
"PennyWise Pricing Page" has no incoming links.
Fix: Add link from comparison table in Article 2.

## Best Practices

- ✅ **Do:** Every cluster article must have at least one Cluster → Pillar link
- ✅ **Do:** Link reviews to relevant comparisons, buyer guides, and product category pages
- ✅ **Do:** Link problem/education articles to practical buying guides when the user is likely moving toward a decision
- ✅ **Do:** Write a Danish context sentence for every suggestion — anchor text needs natural placement
- ✅ **Do:** Fix orphan pages before adding any new links
- ❌ **Don't:** Use the same exact-match anchor for the same target page more than once
- ❌ **Don't:** Over-optimise every anchor; mix exact, partial, descriptive, and natural Danish anchors
- ❌ **Don't:** Push lead-generation links too aggressively in informational articles
- ❌ **Don't:** Add more than 100 outgoing internal links on any single page

## Common Pitfalls

- **Problem:** All cluster articles link to the pillar but not to each other
  **Solution:** Add Cluster → Cluster links between semantically related articles to build depth.

- **Problem:** Same anchor text used across multiple pages for the same target
  **Solution:** Use partial match and branded anchors for subsequent links after the first exact-match use.

## Related Skills

- `@seo-aeo-content-cluster` — generates the cluster map this skill links together
- `@seo-aeo-blog-writer` — writes or updates the articles that receive internal links

## Additional Resources

- [SEO-AEO Engine Repository](https://github.com/mrprewsh/seo-aeo-engine)
- [Full Internal Linking SKILL.md](https://github.com/mrprewsh/seo-aeo-engine/blob/main/.agent/skills/internal-linking/SKILL.md)

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
