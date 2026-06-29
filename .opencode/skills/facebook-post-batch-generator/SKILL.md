````md
---
name: facebook-post-batch-generator
description: Generate a weekly batch of 10 Danish Facebook posts for Indeklima Guiden based on existing article markdown files, recent Facebook post history, and current news/seasonal angles.
---

# Facebook Post Batch Generator for Indeklima Guiden

Use this skill when the user wants to generate a weekly batch of Facebook posts for `indeklimaguiden.dk`.

The goal is to create 10 publication-ready Danish Facebook posts for Monday-Friday, with two posts per day:
- 10:00
- 17:00

The posts should drive traffic to Indeklima Guiden while also creating Facebook engagement.

## Required user input

Before generating anything, ask the user which posting week the batch is for.

The user must provide either:
- the Monday date of the posting week, for example `2026-07-06`
- or a clear week reference that can be converted into a Monday date

Do not continue until the posting week is known.

The generated file must be named after the posting week Monday date:

```text
src/content/fb-posts/YYYY-MM-DD.md
````

Example:

```text
src/content/fb-posts/2026-07-06.md
```

Never use the current date unless the user explicitly says that the current week is the posting week.

## Repository paths

Article files are located in:

```text
src/content/articles
```

Facebook post files are located in:

```text
src/content/fb-posts
```

If `src/content/fb-posts` does not exist, create it.

If there are no previous Facebook post markdown files, continue normally and treat this as the first batch.

## Do not overwrite existing files

Before writing the output file, check whether this file already exists:

```text
src/content/fb-posts/YYYY-MM-DD.md
```

If it exists, do not overwrite it.

Instead create the next available version:

```text
src/content/fb-posts/YYYY-MM-DD-v2.md
src/content/fb-posts/YYYY-MM-DD-v3.md
```

Use the first filename that does not already exist.

## Article frontmatter

Articles are markdown or MDX files with frontmatter similar to:

```yaml
---
title: "Aircondition installation: Guide til pris, regler og montering"
seoTitle: "Aircondition installation: Pris, regler og montering"
description: "Få overblik over aircondition installation i Danmark: pris, regler, standardmontering, placering af inde- og udedel og hvad du selv må gøre."
seoDescription: "Læs hvad aircondition installation koster, om du selv må installere split aircondition, og hvordan du vælger placering og installatør."
pubDate: 2026-06-26
updatedDate: 2026-06-26
category: "aircondition"
articleType: "guide"
slug: "aircondition-installation"
tags: ["aircondition", "aircondition installation", "aircondition montering", "split aircondition", "luft til luft varmepumpe", "KMO"]
draft: false
featured: false
commercialDisclosure: true
schemaType: "Article"
faq:
  - question: "Må jeg selv installere aircondition?"
    answer: "Nej, ikke hvis der er tale om split aircondition, hvor kølekreds, kølerør eller kølemiddel skal samles eller håndteres. Her skal du bruge en professionel installatør med de rette godkendelser."
---
```

Use the article frontmatter to understand:

* title
* description
* seoTitle
* seoDescription
* slug
* category
* articleType
* tags
* FAQ questions and answers
* commercialDisclosure
* draft status

Ignore articles where:

```yaml
draft: true
```

## Article URL discovery

The main domain is:

```text
https://indeklimaguiden.dk/
```

Do not assume the URL pattern blindly.

Inspect the Astro site structure when needed:

* `src/pages`
* `src/content/config.*`
* any route logic
* article collection rendering
* slug usage

Figure out the actual article URL structure from the Astro project.

Use the article `slug` when constructing URLs.

If the route cannot be determined confidently, use the safest likely structure and add a review note in the generated markdown.

## UTM tracking

Every article link must include:

```text
utm_source=facebook
utm_content=<day>_<time>_<pillar>
```

Use lowercase day names in English for `utm_content`.

Examples:

```text
utm_content=monday_1000_pain
utm_content=monday_1700_price
utm_content=tuesday_1000_news
utm_content=wednesday_1700_checklist
```

If the URL already contains query parameters, append UTM parameters with `&`.

If the URL does not contain query parameters, append UTM parameters with `?`.

Example:

```text
https://indeklimaguiden.dk/aircondition-installation?utm_source=facebook&utm_content=monday_1700_price
```

Do not add `utm_medium` or `utm_campaign` unless the user later asks for it.

## Previous post history

Read the latest 10 markdown files in:

```text
src/content/fb-posts
```

Use file modification date or filename date to determine the newest files.

Use these files to understand:

* recently used article URLs
* recently used article slugs
* recently used hooks
* recently used topics
* recently used angles
* recently used post structures

Avoid using the same 2-3 articles repeatedly across multiple runs.

Important:

* It is allowed to reuse the same broad topic over time.
* It is allowed to spin the same topic from different angles.
* It is allowed to use the same hook style across different batches.
* Do not use the same hook twice inside the same 10-post batch.
* Avoid using the same articles from the previous 2-3 generated batches unless there are not enough suitable alternatives.

## Batch content strategy

Generate exactly 10 posts.

The batch should have coherence. It is okay for the 10 posts to focus on only 2-3 broader themes or article clusters, as long as the individual posts use different angles.

Examples of coherent weekly themes:

* aircondition, bedroom heat, ventilation
* condensation, humidity, mold risk
* ventilation, CO₂, indoor air quality
* allergies, dust mites, children’s rooms
* aircondition price, installation, electricity use

Do not make all 10 posts about the exact same problem.

Prefer using a focused set of 2-3 article clusters per batch, but avoid repeating the same article too many times.

Recommended maximum:

* Use 2-3 main topics per batch.
* Use several related articles if available.
* Do not use the same article more than 3 times in the same batch.
* Prefer different angles if the same article is reused.

## Weekly posting structure

Use this structure unless the user asks for something else:

```text
Monday 10:00     Pain
Monday 17:00     Price
Tuesday 10:00    News/seasonal
Tuesday 17:00    Pain
Wednesday 10:00  Myth/fact
Wednesday 17:00  Checklist/guide
Thursday 10:00   News/tip
Thursday 17:00   Price/comparison
Friday 10:00     Pain/saveable
Friday 17:00     Roundup/soft CTA
```

## Pillars

The core pillars are:

### Pain

Pain posts should make the reader recognize a problem in their own home.

Use direct reader-focused hooks such as:

```text
Har du også dug på vinduerne hver morgen?
Føles luften tung i soveværelset om morgenen?
Bliver dit soveværelse alt for varmt om aftenen?
```

Pain posts should be practical, not fearmongering.

Use cautious language:

* "kan være tegn på"
* "kan hænge sammen med"
* "kan øge risikoen for"
* "kan være værd at undersøge"

Avoid absolute claims.

### News

News posts should use current or timely relevance.

Use web/news research when available.

News can include:

* actual news from approved sources
* seasonal relevance
* summer heat
* winter condensation
* pollen season
* humidity periods
* energy/tilskud updates
* industry or regulation updates

If no relevant current news is found, use seasonal relevance based on the posting week.

### Price

Price posts should give the reader concrete price value directly in the Facebook post.

Do not treat price posts as thin commercial teasers or simple "click to see prices" posts. They should be useful even if the reader does not click.

Price posts can target people close to a decision, but the primary goal is to help the reader understand costs, tradeoffs, and realistic expectations.

Use topics such as:

* price
* electricity consumption
* installation cost
* comparison
* what is worth buying
* aircondition vs ventilator
* mobile aircondition vs split aircondition
* heat pump vs aircondition
* affugter running cost

Price posts should usually include several of these elements directly in the post:

* concrete price ranges or realistic examples when supported by the article or reliable context
* what drives the price up or down
* what is typically included and not included
* what can make the cheap option expensive later
* simple running-cost examples when relevant
* a practical rule of thumb the reader can use before buying or requesting an offer

Price posts can be written as a small, standalone article for Facebook.

When the source article supports it, prefer a "tinyfied article" format with a strong headline and numbered points, for example:

```text
7 ting der afgør, hvad en aircondition faktisk koster
```

Then give useful short sections such as:

```text
1. Selve anlægget er kun én del af prisen
Forklar kort hvad brugeren ofte glemmer at regne med.

2. Installation kan gøre den store forskel
Forklar hvorfor placering, rørføring eller el kan ændre prisen.

3. Den billigste løsning kan blive dyrere i drift
Forklar med et simpelt eksempel eller en praktisk tommelfingerregel.
```

Use numbered points when it improves readability. Good formats include:

* `5 ting der påvirker prisen`
* `7 typiske udgifter du bør kende`
* `3 steder hvor den billige løsning kan blive dyr`
* `6 spørgsmål du bør stille før du køber`

Each point should teach something concrete. Avoid list items that are only vague teasers.

Good price-post hooks:

```text
Hvad koster en affugter egentlig i strøm?
Er en mobil aircondition billigere end split aircondition i længden?
Hvorfor kan to tilbud på aircondition-installation være så forskellige?
```

Good price posts should still link to the website article, but the CTA should feel like a next step for more detail, examples, caveats, or buying guidance.

Avoid CTAs that withhold the entire answer, such as:

```text
Se prisen her.
Klik for at finde ud af hvad det koster.
```

Prefer CTAs such as:

```text
Vi har samlet flere regneeksempler og typiske faldgruber i guiden.
Se den fulde oversigt, hvis du vil sammenligne pris, drift og installation.
```

Do not overdo commercial intent unless the user asks for it.

## Approved news and research sources

When generating news/seasonal posts, search these sources first when web access is available:

```text
https://www.hvacfokus.dk/
https://www.building-news.dk/category/baeredygtighed/indeklima/
https://danvak.dk/nyheder/
https://www.veltek.dk/ventilation/

https://www.sst.dk/vidensbase/forebyggelse/forurening-og-miljoe/indeklima
https://ens.dk/tilskud-og-puljer/tilskuds-stoetteordninger
https://www.kefm.dk/aktuelt/nyheder

https://www.bolius.dk/
https://www.bolius.dk/indeklima-17512
https://www.astma-allergi.dk/viden-om/indeklima/

https://greenpowerdenmark.dk/nyheder
https://www.danskindustri.dk/brancher/di-teknik-og-installation/nyhedsarkiv/
https://www.danskerhverv.dk/presse-og-nyheder/nyheder/
https://via.ritzau.dk/

https://energihjem.dk/tilskud/
https://www.3byggetilbud.dk/
```

Also use these Google News searches when web access is available:

```text
https://news.google.com/search?q=indeklima
https://news.google.com/search?q=varmepumpe
https://news.google.com/search?q=varmepumpepuljen
https://news.google.com/search?q=aircondition%20Danmark
https://news.google.com/search?q=affugter
https://news.google.com/search?q=ventilation%20indeklima
https://news.google.com/search?q=skimmelsvamp%20bolig
https://news.google.com/search?q=luftfugtighed%20bolig
```

When using news:

* Prefer recent sources.
* Do not invent news.
* Do not quote large parts of articles.
* Summarize briefly.
* Connect the news angle back to one of Indeklima Guiden’s own articles.
* If using a news item, include a short source note in the generated markdown for human review.

## Seasonality rules

Use the posting week date to prioritize topics.

### Spring

Prioritize:

* pollen
* allergies
* ventilation
* cleaning
* dust mites
* air quality

### Summer

Prioritize:

* aircondition
* bedroom cooling
* ventilation during heat
* aircondition electricity use
* aircondition vs ventilator
* mobile aircondition
* humidity

### Autumn

Prioritize:

* condensation
* humidity
* ventilation
* mold prevention
* heating transition
* indoor air quality

### Winter

Prioritize:

* condensation
* dry air
* ventilation
* mold risk
* heating
* humidity balance
* CO₂ indoors

## Writing style

All Facebook post content must be in Danish.

Use a tone that is:

* helpful
* practical
* trustworthy
* conversational
* aimed at Danish homeowners
* direct but not pushy

Write to the reader using "du".

Avoid:

* hype
* fearmongering
* fake urgency
* clickbait that overpromises
* excessive emojis
* English marketing phrases
* medical diagnosis
* absolute health claims

Use emojis very rarely and only functionally:

* checkmarks for lists are allowed
* pointing down emoji is allowed for comment/link instructions
* avoid decorative emojis

Use correct Danish spelling and grammar.

Examples:

* Use "dug", not "duk"
* Use "morgen", not "mogen"
* Use "luftfugtighed", not overly technical alternatives unless needed

## Post length

Most posts should be 90-140 words.

Shorter posts are allowed when appropriate.

Price posts should usually be longer than other posts because they should deliver concrete value directly in the post.

For normal price posts, aim for 150-250 words.

For mini-article price posts with numbered points, 250-450 words is allowed when the post remains useful, skimmable, and specific.

Do not make every price post long. Use the longer format when the article contains enough substance to support it.

In a normal 10-post weekly batch, at least one price post should usually use the longer mini-article format, unless no suitable price-focused article is available.

Avoid very long posts unless the format clearly benefits from it.

## Engagement strategy

Every post should include at least one engagement element.

Use low-friction engagement, such as:

* A/B/C/D question
* "Oplever du det mest i soveværelset eller stuen?"
* myth/fact question
* "Har du også...?"
* saveable checklist
* comparison question

Avoid asking abstract or difficult questions.

Bad:

```text
Hvad tænker du om indeklimaets betydning for den generelle boligkomfort?
```

Good:

```text
Hvad oplever du mest derhjemme?

A) Dug på vinduerne
B) Tør luft
C) For varmt soveværelse
D) Indelukket luft
```

## Link strategy

The user only uses the comment-link version.

Do not generate a scheduling version or any post text with the direct URL inside the post body.

For every post, output:

1. `Post text - comment-link version`

   * Publication-ready Facebook post without the direct URL.
   * Ends with a sentence such as:

```text
Jeg linker til guiden i kommentaren.
```

2. `First comment`

   * Contains the direct article link with UTM tracking.
   * This is the only place the link should appear for each post.

Do not overuse the pointing-down emoji.

## Image prompt strategy

Do not create an image prompt for every post.

Only include an image prompt when an image would clearly make sense.

Good candidates:

* condensation on windows
* bedroom heat
* ventilation
* aircondition unit
* mold/foggy window
* humidity meter
* child’s room air quality
* dust/allergy topic

If an image prompt is included, write it as a prompt the user can paste into ChatGPT image generation.

Image prompts must:

* be in English for better image generation
* be realistic
* fit Danish homes
* avoid text/logos in the image unless explicitly needed
* not include the Indeklima Guiden logo unless the user asks
* be suitable for Facebook

Example:

```text
Realistic photo of a Danish bedroom window in the morning with visible condensation on the lower part of the glass, soft natural light, neutral Scandinavian interior, no text, no logo.
```

## Health, safety, and credibility rules

Indeklima topics can touch health, mold, allergies, children, sleep, and air quality.

Never diagnose.

Never say that a home definitely has mold, disease, or dangerous air based only on symptoms.

Use cautious language:

* "kan være"
* "kan skyldes"
* "kan være tegn på"
* "kan øge risikoen"
* "bør undersøges nærmere"

For serious mold, persistent moisture, or health symptoms, recommend professional assessment or relevant expert guidance.

Avoid medical advice.

## Output markdown format

The generated markdown file must use this structure:

```md
---
title: "Facebook posts for week of YYYY-MM-DD"
weekStart: "YYYY-MM-DD"
site: "Indeklima Guiden"
domain: "https://indeklimaguiden.dk/"
posts: 10
status: "draft"
---

# Facebook posts for week of YYYY-MM-DD

## Editorial summary

Short summary of the weekly theme, selected article clusters, and any news/seasonal angle used.

## Source articles used

List the article titles, slugs, and final URLs used.

## News/source notes

Only include this section if web/news sources were used.

List short source notes for human review.

---

## Monday 10:00 — Pain — [internal post title]

**Pillar:** Pain  
**Post type:** Pain question  
**Source article:** [Article title]  
**Article URL:** [URL without UTM]  
**Tracked URL:** [URL with UTM]  
**Engagement mechanic:** [A/B/C/D question, myth/fact, saveable checklist, etc.]

### Post text - comment-link version

[Publication-ready Facebook post without direct URL. Ends with comment-link CTA.]

### First comment

[Direct article link with UTM.]

### Image prompt

Only include if useful. Otherwise write:

Not needed.

### Editorial note

Short note explaining why this post exists and what angle it uses.
```

Repeat this format for all 10 posts.

## Validation pass

After drafting the 10 posts, perform a validation pass before writing the file.

Check all of the following:

### Duplicate checks

* No duplicate hooks inside the 10-post batch.
* No duplicate post text.
* No overuse of the same article.
* No obvious repetition from the latest 10 existing Facebook post files.
* No same 2-3 articles repeated from the previous 2-3 batches unless unavoidable.

### Schedule checks

* Exactly 10 posts.
* Monday-Friday only.
* Times are 10:00 and 17:00.
* Filename matches the posting week Monday.

### Language checks

* All post text is in Danish.
* Tone is conversational and helpful.
* Posts speak directly to the reader using "du".
* No English marketing phrases inside the actual Facebook posts.

### Link checks

* Every tracked URL includes `utm_source=facebook`.
* Every tracked URL includes `utm_content=<day>_<time>_<pillar>`.
* URLs use the discovered Astro article URL structure.
* Links are correct and point to Indeklima Guiden.

### Credibility checks

* No diagnosis.
* No overclaiming.
* No fearmongering.
* Health and mold claims are cautious.
* Commercial posts are transparent and practical.

### Engagement checks

* Every post includes an engagement mechanism.
* Questions are easy to answer.
* At least some posts use A/B/C/D, myth/fact, or saveable checklist formats.

### Emoji checks

* Emojis are used very sparingly.
* Emojis are functional only.

### Image prompt checks

* Not every post has an image prompt.
* Image prompts are only included where they clearly add value.
* Image prompts are in English.
* Image prompts do not ask for text/logo unless needed.

If the validation finds problems, revise the posts before writing the final file.

## Final response to user

After creating the markdown file, respond with:

* the file path
* a short summary of the weekly theme
* which article clusters were used
* any warnings or review notes
* confirmation that no existing file was overwritten

Do not paste all 10 posts in the chat unless the user asks.

```
```
