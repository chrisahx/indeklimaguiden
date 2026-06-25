
---
name: seo-aeo-blog-writer
description: "Writes Danish long-form articles, product reviews, comparisons, and buyer guides about aircondition, varmepumper, affugtere, luftrensere, strømforbrug, størrelse, and indeklima for SEO ranking and AEO citation. Activate when the user wants to write a Danish blog post, review, comparison, or guide."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Blog Writer

## Overview

Writes structured Danish long-form content (800–3000 words, longer for pillar guides when needed) for a Danish audience researching aircondition, varmepumper, affugtere, luftrensere, strømforbrug, størrelse/kapacitet, installation, boligtyper, and indeklimaproblemer. Content must satisfy both SEO ranking signals and AEO citation requirements while staying useful, practical, and locally relevant.

Every article should normally include a short direct-answer block, a clear definition or recommendation sentence where relevant, structured H2/H3 hierarchy, a comparison/specification table when comparing units or options, and 5 FAQ entries written for AI extraction. Avoid generic AI copy: include concrete Danish use cases, practical tradeoffs, and buyer-focused advice.

Part of the [SEO-AEO Engine](https://github.com/mrprewsh/seo-aeo-engine).

## When to Use This Skill

- Use when writing a Danish cluster article from a content cluster map
- Use when creating a product review, comparison, buyer guide, explainer, or practical how-to article
- Use when answering questions like which unit fits an apartment, villa, summer house, bedroom, basement, or office
- Use when explaining electricity use, noise, capacity, cooling/heating performance, humidity control, filter types, installation, maintenance, or Danish climate considerations
- Use when you need content that can be cited by AI engines like Perplexity or ChatGPT
- Use when you need a blog post that follows a consistent, auditable structure

## How It Works

### Step 1: Write the TL;DR Block First
Write a 2–3 sentence direct answer in Danish to the article's core question. Place it immediately after the H1 in a blockquote. This is the first block AI engines attempt to extract. For reviews and comparisons, state the practical recommendation early: who the unit is best for, when it is not a good fit, and the main tradeoff.

### Step 2: Build the Heading Skeleton
Set H1, H2s (4–6), and H3s before writing any body content. Use Danish search intent, not a rigid template. For explainers, the first H2 should often be a "Hvad er..." section with a clean definition sentence. For reviews, start with verdict, key specs, pros/cons, and who the product fits. For comparisons, start with a comparison table and recommendation summary.

### Step 3: Write Body Sections
Choose the section order based on intent:
- Explainer: Hvad er det? → Hvordan virker det? → Hvornår giver det mening? → Strømforbrug/økonomi → Valg af størrelse → Fejl at undgå → FAQ → Konklusion.
- Product review: Kort dom → Specifikationer → Fordele/ulemper → Test/vurdering af ydelse → Strømforbrug → Støj og komfort → Hvem passer den til? → Alternativer → FAQ → Konklusion.
- Comparison: Hurtig anbefaling → Sammenligningstabel → Bedst til forskellige boligtyper → Pris/strømforbrug → Installation/vedligehold → Hvilken skal du vælge? → FAQ → Konklusion.
- Buyer guide: Hvad skal du kigge efter? → Kapacitet og boligtype → Strømforbrug → Støj → Funktioner → Installation → Typiske fejl → FAQ → Konklusion.

### Step 4: Write 5 FAQ Entries
Use Danish long-tail and secondary keywords as questions. Each answer must be under 50 words and self-contained — readable without any surrounding context. Cover practical questions about kWh, m2, støjniveau, installation, vedligeholdelse, indeklima, fugt, allergi, sommerhus, lejlighed, villa, kælder, or soveværelse where relevant.

### Step 5: Run AEO and SEO Checklists
Verify Danish language, Danish audience fit, TL;DR/direct answer, clear verdict or definition, FAQ count, keyword placement, heading structure, comparison/spec table where useful, internal link opportunities, and whether the article gives practical advice beyond generic manufacturer claims.

## Examples

### Example: TL;DR Block
How to Manage a Remote Engineering Team

TL;DR: Managing a remote engineering team requires async
communication tools, clear documentation standards, and
timezone-aware sprint planning. Teams that nail these three
areas ship consistently regardless of where members are located.


### Example: FAQ Section
Q: What is the biggest challenge of remote engineering teams?
A: Async communication. Without shared hours, decisions slow down
and context gets lost. Teams that document decisions in writing
and use structured standup tools close this gap fastest.
Q: How do you run a daily standup with a remote team?
A: Use async video or text standups posted at the start of each
member's day. Tools like Loom or Slack threads work well.
Avoid live calls across more than 2 timezones.

## Best Practices

- ✅ **Do:** Write in natural Danish for Danish homeowners, renters, and summer house owners
- ✅ **Do:** Give a clear recommendation, not just neutral descriptions
- ✅ **Do:** Include concrete criteria: m2 coverage, BTU/kW, kWh use, noise dB, installation type, filter/affugtning features, and typical use case where relevant
- ✅ **Do:** Use secondary Danish keywords as FAQ questions to capture long-tail traffic
- ✅ **Do:** Mention when professional installation or contractor help may be needed, without making unsupported legal or technical claims
- ❌ **Don't:** Write generic content that could fit any country or any product category
- ❌ **Don't:** Overstate savings, health effects, or performance without evidence or caveats
- ❌ **Don't:** Write FAQ answers longer than 50 words — AI engines skip long answers
- ❌ **Don't:** Use duplicate H2 headings anywhere in the article
- ❌ **Don't:** Skip the comparison table if the topic involves comparing units, technologies, or buying options

## Common Pitfalls

- **Problem:** TL;DR block is too vague to be extracted as a direct answer
  **Solution:** The TL;DR must answer the article's core question in 2–3 sentences. If it doesn't answer a specific question, rewrite it.

- **Problem:** FAQ answers reference "as mentioned above" or other context
  **Solution:** Every FAQ answer must stand completely alone — no references to other parts of the article.

## Related Skills

- `@seo-aeo-content-cluster` — provides the topic and keyword for this article
- `@seo-aeo-content-quality-auditor` — audits the completed post for SEO and AEO signals
- `@seo-aeo-internal-linking` — maps links between this post and related pages

## Additional Resources

- [SEO-AEO Engine Repository](https://github.com/mrprewsh/seo-aeo-engine)
- [Full Blog Writer SKILL.md](https://github.com/mrprewsh/seo-aeo-engine/blob/main/.agent/skills/blog-writer/SKILL.md)

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
