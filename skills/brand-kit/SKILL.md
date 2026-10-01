---
name: brand-kit
description: Creates a social-media brand book and the machine-readable brand.json that every Reel Studio video uses (colours, fonts, graphic patterns, tone of voice, CTA format). Use when the user says "creami il brand book", "crea il mio brand kit", "moodboard del mio brand", "brand guidelines per i social", "set up my brand", or when reel-editor needs a brand.json that does not exist yet.
---

# Brand Kit

Build the brand foundation that every video, carousel and cover will follow. Output two things:

1. **brand.json** – the tokens the video engine reads (schema in `references/brand-schema.md`, full example in `examples/demo-brand.json`).
2. **Brand book** – a readable page/PDF for the human (colours, fonts, patterns, tone, CTA format, prompt library).

Everything visual in Reel Studio comes from brand.json. A weak brand.json = generic videos. Spend the effort here.

## Step 1 – Interview (keep it short, 2–3 rounds)

Ask with AskUserQuestion when available, otherwise in one compact message. Full question bank and why each matters: `references/questions.md`. Minimum set:

- Brand name + social handle; language of the content.
- **Logo** (PNG/SVG upload) and/or **website URL**. If either exists, extract colours from it before asking about colours.
- Colours they already use (hex if known). If none: ask for 2–3 adjectives for the brand mood and propose a palette.
- Fonts they already use (if any). Otherwise propose a pairing from `references/font-pairs.md` (all Google Fonts, free).
- Who they talk to (target), what they sell, 2–4 content pillars.
- Tone: 3 sentences "we talk like this" and 3 "never like this". Do they speak as "io" or "noi"? "tu" or "lei"?
- CTA mechanic: keyword-comment + DM (e.g. "Commenta GUIDA"), link in bio, or DM. The keywords per pillar.
- 2–3 reference accounts they like (style only).

Do not ask what can be derived. Do not invent facts about the business.

## Step 2 – Extract & decide

- From a logo: `python3 scripts/extract_palette.py <logo-or-screenshot>` prints dominant colours. From a website: take a screenshot if a browser is available, or ask for one.
- Build the 9 colour roles (see schema): background (60%), dark (30%), ONE accent (10%) + accent_dark (readable on light bg), accent_soft (glows), surface, ink, muted, dark_glow.
- Check contrast: ink on background ≥ 7:1, white on accent ≥ 3:1 (titles), accent_dark on background ≥ 4.5:1. `extract_palette.py --check brand.json` reports contrast; fix failing pairs by darkening/lightening.
- Fonts: display (titles, heavy, ideally condensed, used UPPERCASE), body (captions + text, needs a bold ≥800 or a variable font), quote (italic serif, used once per piece). Fill `google` with the path in github.com/google/fonts (`ofl/<family>/<File>.ttf`, `[`→`%5B`, `]`→`%5D`) so setup can download it. For a custom brand font the user uploads, set `local` to the file path instead.
- Patterns (always include): accent word + accent full stop in titles, accent block behind key word on video, number circle for steps, strike-through myth → truth, quote style.

## Step 3 – Write the outputs

1. Write `brand.json` (validate it is valid JSON and every key of the schema exists).
2. Render the brand book: `python3 scripts/build_brandbook.py brand.json <out_dir>` → `brandbook.html` (+ `brandbook.pdf` when a Chromium is available). Fonts must be downloaded first; the script does it.
3. Show the user the brand book (open/publish the HTML as a page if the host supports it, otherwise send the PDF) and ask for changes. Iterate until they approve.

## Step 4 – Save it where the next session finds it

- If the session has a Project / persistent docs: save `brand.json` and the brand book there (e.g. `brand/brand.json`). Tell the user it is saved.
- Otherwise deliver `brand.json` as a file and tell the user to upload it together with every new video.
- Never mix two brands: one brand.json per client. Name files `brand-<handle>.json` when an agency manages several clients.

## Rules

- One accent colour only. Never two accents in the same frame.
- No gradients across the full screen except the soft radial glow on dark slides.
- Titles max 8 words. One accent word per title.
- Keep the user's own wording for tone examples – do not "improve" them.
