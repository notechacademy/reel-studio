# Scene catalogue – props reference

Every scene in `edit.json → scenes[]`:
`{ "type": "...", "from": <frame>, "to": <frame>, "n": <section number, optional>, "tag": "SHORT LABEL (optional)", "props": {...} }`
- All `at`, `*_at`, `times` = ABSOLUTE output frames.
- Accent syntax in any text: `"IL METODO IN *3 STEP*."` → "3 STEP" in the accent colour. One accent per text.
- The badge on top ("ESEMPIO" + tag) comes from `edit.example_label` ("" hides it). `kinetic-title` and `quote` have no badge.

## Universal (any topic)

### kinetic-title
```json
{"dark": true, "words": [{"text": "NON", "at": 230}, {"text": "SERVE", "at": 238}, {"text": "POSTARE", "at": 246}, {"text": "DI", "at": 254}, {"text": "*PIÙ*.", "at": 262}],
 "sub": {"text": "Serve postare meglio.", "at": 290}}
```
One word per spoken word (use their frames). ≤ 8 words. `dark` alternates rhythm with light scenes.

### steps
```json
{"headline": "IL METODO IN *3 STEP*.", "steps": [{"title": "Scegli *l'obiettivo*", "sub": "una riga", "at": 420}, {"title": "Crea", "at": 450}, {"title": "Misura", "at": 480}]}
```
2–5 steps, titles ≤ 22 characters.

### checklist
```json
{"headline": "I PRIMI *3 SECONDI*.", "items": [{"text": "Logo animato", "at": 240, "bad": true}, {"text": "Il risultato subito", "at": 290}]}
```
3–5 items ≤ 24 characters. `bad: true` = crossed (mistakes).

### before-after
```json
{"headline": "MITO VS *VERITÀ*.", "before": {"label": "PRIMA", "text": "Allenarsi ogni giorno", "sub": "e farsi male", "at": 300},
 "after": {"label": "DOPO", "text": "3 allenamenti mirati", "sub": "e recupero", "at": 340}}
```

### big-number
```json
{"headline": "IN *30 GIORNI*.", "from": 0, "to": 48000, "prefix": "+", "suffix": "", "caption": "una riga che spiega il numero", "count_from_at": 500, "count_to_at": 560}
```
Only numbers the user said or confirmed.

### bar-chart
```json
{"headline": "COSA *FUNZIONA* DI PIÙ.", "unit": "%", "bars": [{"label": "Opzione A", "value": 68, "at": 620, "highlight": true}, {"label": "Opzione B", "value": 31, "at": 632}], "caption": "fonte o nota"}
```
2–4 bars. Real data only; if illustrative, caption it ("esempio").

### quote
```json
{"text": "La gente non compra il prodotto. Compra il *perché*.", "author": "Nome", "at": 684, "dark": true}
```

### image-card
```json
{"src": "img/piatto.jpg", "headline": "IL PIATTO *DEL MESE*.", "caption": "una riga in corsivo", "label": "NUOVO", "at": 300}
```
`src` in `reel/public/`. Photos from the user; never stock images of real brands.

### messages
```json
{"headline": "COSA MI *CHIEDONO*.", "title": "Giulia", "messages": [{"from": "them", "text": "Fate anche consulenze?", "at": 852}, {"from": "me", "text": "Sì! Ti mando i dettagli", "at": 868}]}
```
2–5 short messages; a "typing…" bubble appears automatically before each.

### notifications
```json
{"headline": "LE PRENOTAZIONI *ARRIVANO*.", "clock": "9:41", "items": [{"app": "Calendario", "text": "Nuova prenotazione: martedì 18:00", "at": 400, "icon": "calendar"}]}
```

### icon-grid
```json
{"headline": "PERCHÉ *FUNZIONA*.", "items": [{"icon": "clock", "title": "Più veloce", "sub": "in 10 minuti", "at": 884}, {"icon": "target", "title": "Mirato", "at": 894}]}
```
2–4 items. Icons: eye, heart, bubble, plane, check, x, lock, play, bookmark, search, user, bell, cart, arrow, star, clock, euro, home, bolt, shield, target, chart, leaf, calendar, phone, gift.

### phone-recording
```json
{"src": "rec/app.mp4", "device": "phone", "trim_from": 0, "headline": "IL *PROMPT* GIUSTO.",
 "zooms": [{"at": 640, "scale": 1.6, "x": 0.5, "y": 0.8}, {"at": 700, "scale": 1, "x": 0.5, "y": 0.5}],
 "taps": [{"at": 655, "x": 0.82, "y": 0.92}]}
```
`device`: `phone` (vertical recording) or `laptop` (horizontal/desktop recording). x/y = fractions of the screen. Zoom in when the text on screen matters, zoom out before the end. HDR recordings: convert with the build_base tonemap first.

### lottie
```json
{"name": "confetti", "headline": "FATTO*.*"}
```
JSON in `reel/src/data/lottie/confetti.json`, registered in `src/scenes/index.tsx` (`const LOTTIE = { confetti }`). Lottie = After Effects animation exported with the free Bodymovin/LottieFiles plugin, or a free LottieFiles asset.

## Social-media pack (only when the video is about social media)

| type | use for | key props |
|---|---|---|
| `social-profile-follow` | gaining followers | handle, followers_from/mid/to, tap_at, banner_at, banner_text |
| `social-views-stamps` | views / simplicity | reel_lines[], views_from/to, stamps[{text,at}] (≤3), note{text,at} |
| `social-comments` | engagement / opinions | headline, topic, comments[[user,text]], times[] |
| `social-share-sheet` | shares / relatable content | pov{tag,text,sub,at}, sheet_at, tap_at, plane_at, sent_at, reply, friends[] |
