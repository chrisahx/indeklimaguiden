---
name: seo-aeo-content-quality-auditor
description: "Audits Danish indoor climate content for SEO, AEO, usefulness, trust, and conversion readiness with scored reports and severity-ranked fixes. Activate when the user wants to audit, review, or score Danish articles, reviews, comparisons, or buyer guides about aircondition, varmepumper, affugtere, luftrensere, or related topics."
risk: safe
source: community
date_added: "2026-04-01"
---

# SEO-AEO Content Quality Auditor

## Overview

Runs a dual SEO + AEO audit on Danish landing pages, blog posts, product reviews, comparisons, and buyer guides about indoor climate products. Produces an overall score, SEO score, AEO score, usefulness/trust score, and readability score — each out of 100 — with severity-ranked issue lists (Critical / Warning / Polish), exact fix instructions for every issue, and projected scores after all fixes are applied.

Part of the [SEO-AEO Engine](https://github.com/mrprewsh/seo-aeo-engine).

## When to Use This Skill

- Use when auditing a Danish landing page or blog post before publishing
- Use when reviewing product reviews, comparison articles, buyer guides, and technical explainers
- Use after the blog-writer skill outputs content
- Use when diagnosing why existing content is underperforming in search
- Use when you need a scored, actionable SEO and AEO report

## How It Works

### Step 1: Run SEO Checks
Verify Danish keyword targeting, search intent match, H1/H2/H3 structure, meta title/description potential, word count, sentence length, paragraph density, title clarity, and whether the content targets one primary query without cannibalising another page. Treat keyword density as a weak signal; prioritise intent match, topical coverage, and helpfulness.

### Step 2: Run AEO Checks
Check for Danish TL;DR/direct-answer block, definition or verdict sentence, FAQ section (minimum 4 entries, normally 5), bullet and numbered lists, comparison/specification table, and extractable direct answers. Score each signal as found or missing.

### Step 3: Run Readability Checks
Check natural Danish readability, passive voice, transition word presence, wall-of-text paragraphs, subheading frequency, reading level, and whether technical terms like BTU, kW, kWh, COP/SCOP, affugtning, HEPA, dB, and m2 are explained clearly.

### Step 4: Run Usefulness and Trust Checks
Check whether the content gives practical buying help for a Danish audience: concrete recommendations, pros/cons, who the unit fits, who it does not fit, electricity-use caveats, installation considerations, maintenance requirements, safety/legal caveats where relevant, and no unsupported claims about savings, health benefits, mold removal, or performance.

### Step 5: Score and Prioritise
Calculate SEO, AEO, usefulness/trust, readability, and overall scores out of 100. Sort all issues into Critical (fix before publishing), Important (fix soon), and Polish (optional improvements). Generate projected scores after all fixes are applied.

## Scoring System

| Score | Status | Label |
|-------|--------|-------|
| 85–100 | ✅ Pass | Strong |
| 70–84 | ⚠️ Warn | Acceptable |
| 50–69 | 🔶 Weak | Needs work |
| 0–49 | ❌ Fail | Do not publish |

## Examples

### Example: Audit Summary
Overall Score:    84/100  ⚠️ Acceptable
SEO Score:        88/100  ✅ Pass
AEO Score:        74/100  ⚠️ Acceptable
Readability:      91/100  ✅ Pass
Verdict: Strong SEO foundation. AEO needs a TL;DR block
and one more FAQ entry before publishing.
🔴 Critical (fix before publishing):

AEO: No TL;DR block found
Fix: Add a 2–3 sentence direct-answer block in a
blockquote immediately after the H1.

🟡 Important (fix soon):
2. AEO: FAQ has 3 entries — minimum is 4
Fix: Add one more FAQ entry using a secondary keyword
as the question.
Projected score after fixes: 93/100 ✅

## Best Practices

- ✅ **Do:** Fix all Critical issues before publishing — they block SEO trust, AEO extraction, or user usefulness
- ✅ **Do:** Use the projected score to prioritise which fixes to make first
- ✅ **Do:** Check whether the article is genuinely useful for Danish buyers, not just structurally optimised
- ✅ **Do:** Check that reviews and comparisons include specs, tradeoffs, and clear recommendations
- ✅ **Do:** Check that claims about electricity use, health, humidity, installation, or savings are cautious and evidence-aware
- ❌ **Don't:** Publish content scoring below 50/100 overall
- ❌ **Don't:** Ignore AEO warnings — they directly affect AI engine citation probability
- ❌ **Don't:** Let generic manufacturer-style copy pass as a helpful review

## Common Pitfalls

- **Problem:** SEO score is high but AEO score is low
  **Solution:** Traditional SEO tools miss AEO signals entirely. Run the AEO checklist separately and treat it as equally important.

- **Problem:** Fix list is long and overwhelming
  **Solution:** Work through Critical issues only first, re-run the audit, then tackle Important issues.

## Related Skills

- `@seo-aeo-blog-writer` — produces the content this skill audits
- `@seo-aeo-content-cluster` — provides the topic, intent, and internal link context for the audit
- `@seo-aeo-internal-linking` — uses audit output to improve internal links and conversion paths

## Additional Resources

- [SEO-AEO Engine Repository](https://github.com/mrprewsh/seo-aeo-engine)
- [Full Content Quality Auditor SKILL.md](https://github.com/mrprewsh/seo-aeo-engine/blob/main/.agent/skills/content-quality-auditor/SKILL.md)

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
