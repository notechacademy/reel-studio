---
name: explainer-scenes
description: Decides on its own where a talking video needs motion graphics and which ones - kinetic titles, steps, checklists, before/after, numbers, charts, quotes, chats, notifications, photos/products, icon grids, real screen recordings, Lottie - and times every beat to the spoken words. Works for any topic and niche. Use inside reel-editor while planning edit.json, or when the user asks for "grafiche", "motion graphics", "esempi animati", "stop motion", "fammi vedere quello che dico".
---

# Explainer scenes

A captioned talking head is "normal". A reel looks *designed* when, every time the speaker says something visual, the viewer **sees** it. Add these scenes **without waiting for the user to ask**: it is part of the edit, like cutting silences.

## 1. Scan the transcript for visual triggers

Go sentence by sentence (word frames from build_base.py) and mark every trigger:

| Trigger in what is said | Scene type |
|---|---|
| A strong statement, a rule, the core message, a twist | `kinetic-title` (words slam in on the words spoken) |
| A process, "first… then… finally", a method | `steps` |
| A list, mistakes, do/don't, requirements | `checklist` (`bad: true` for mistakes) |
| Myth vs truth, before vs after, wrong vs right, old vs new | `before-after` |
| One number (price, %, days, kg, clients, revenue) | `big-number` |
| A comparison of quantities | `bar-chart` |
| A testimonial, a quote, a sentence to remember | `quote` |
| A product, a place, a dish, a result photo, B-roll the user provided | `image-card` |
| A conversation, a client asking, a friend reacting | `messages` |
| Things arriving: bookings, orders, DMs, reminders | `notifications` |
| 2–4 benefits / features / reasons | `icon-grid` |
| An app, website, tool or procedure on a screen | `phone-recording` (`device: "laptop"` for desktop) – needs the user's recording |
| A custom animation the user supplies (After Effects → Lottie) | `lottie` |
| The video is ABOUT social media (followers, views, comments, shares) | `social-*` pack – only then |

Props for every type: `references/scene-catalog.md`.

## 2. Density and rhythm (defaults – follow them unless the user says otherwise)

- Something must change on screen every **2–4 s**: a cut, a punch-in, a card, or a scene.
- Explanatory segments longer than ~4 s get **one scene** (two if > 8 s). Pure emotional/personal moments stay on the face.
- The face opens every section (≥ 1–1.5 s) before a scene covers it; the viewer must keep the human connection.
- Total scene time ≈ 30–50 % of the video. Never two scenes of the same type in a row.
- Hook (first 3 s) stays on the face with the hook card; first scene after the hook.

## 3. Content of the examples

- Concrete and in the viewer's niche: a dentist → appointment notifications; a chef → photo of the dish + steps of the recipe; a personal trainer → before/after, steps of the workout; a lawyer → checklist of documents.
- Use the user's own words for titles. Never invent numbers, results, testimonials or client names: use only what they said or confirmed; otherwise use a non-numeric scene.
- Names in chats/notifications: plausible first names in the content language; no real people, no real brand logos.
- If a real asset would be better (a photo of the product, a screen recording of the app), ASK the user for it once, and meanwhile use the closest drawn scene.

## 4. Timing

- Scene `from` = frame of the word where the example starts; `to` = end of that segment (or the start of the next card).
- Each beat (`at`) on the frame of the word it illustrates; beats ≥ 10 frames apart; first beat ≥ 6 frames after `from` (the 3-photo entrance).
- Minimum 2.5 s per scene.

## 5. Show the plan

One line per scene to the user: *segment → scene → what appears*. Then write edit.json.

## Creating a new scene type

When nothing fits, build a new component in `reel/src/scenes/` with `Stage` (paper or `dark`), `Headline`, `stepF`/`popIn`/`jit` (stop-motion look) and only brand tokens `C.*`/`F.*`; register it in `scenes/index.tsx`; add its sounds in `scripts/mix.py`.
