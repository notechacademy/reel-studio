---
name: reel-copy
description: Writes every piece of text around a branded reel in the brand's voice - on-screen hook, card titles, question keywords, scene headlines, end-card CTA, the Instagram/TikTok caption, hashtags and the "part 2" DM message. Use inside reel-editor, or when the user asks "scrivimi la caption", "che testo metto nel reel", "hook per questo video", "messaggio per chi commenta".
---

# Reel copy

Read `brand.json` → `voice`, `cta`, `pillars`, `language` first. Use the user's own words from the transcript whenever possible: on-screen text should echo what they say, shorter.

## On-screen text
- **Hook card (frame 0)**: ≤ 8 words, a promise, a tension or a question ("3 ERRORI CHE TI COSTANO CLIENTI", "SMETTI DI FARE QUESTO IN PALESTRA"). A second card can answer it on the second sentence.
- **Card titles**: ≤ 6 words, ONE accent word (the concept), accent full stop. Uppercase if `display_uppercase`.
- **Section keyword**: the noun of the section, short (CLIENTI?, ERRORE 1, LO STRETCHING).
- **Scene headline**: the claim in ≤ 6 words, accent on the key word.
- Respect `voice.person`: if the brand speaks as "noi", write on-screen text in "noi" even if the speaker says "io" (spoken "ti dico io cosa fare" → on screen "ECCO COSA FARE").
- Never two accent words in the same title. Never invent numbers or results.

## End card / CTA
Use `cta.format` with a keyword from `cta.keywords` that matches the topic's pillar. The "part 2" must be something real and better than part 1: write it for the user (step 4) and tell them to set the automatic DM.

## Caption (post text)
- 3–6 short lines. Line 1 = a new hook that does NOT repeat the on-screen text (a truth, a tension, a number).
- One line of value or a "save this".
- CTA line with the keyword exactly as on the end card.
- 3–6 hashtags: niche + topic, no generic #love #instagood.
- Respect the brand language and person; no emojis unless the brand uses them (max 1).

## Part 2 DM (for comment automation, e.g. ManyChat)
- 2–4 lines: thanks + the resource (link or content) + ONE qualifying question ("Che attività hai?").
- It must deliver immediately; no "ti scrivo dopo".

## Deliver
Give the caption in a copy-ready block, then the DM message in a second block. Offer one alternative hook line.
