# edit.json – the per-video edit decision file

Location: `reel/src/data/edit.json`. All times are **output frames at 30 fps** (use the frame numbers printed by build_base.py; `seg` = index of the segment in timeline.json).

```jsonc
{
  "sections_total": 3,                       // how many q/a sections → progress bar
  "question_label": "STEP {n} DI {total}",   // label on the question panel
  "question_pre": "VUOI PIÙ",                // small line above the keyword ("" to hide)
  "questions": [                             // one per "q" segment
    { "seg": 1, "n": 1, "keyword": "CLIENTI?", "kw_at": 152 }   // kw_at = frame where the keyword is SAID
  ],
  "cards": [                                 // slim cards on top of the talking shots
    { "from": 0, "to": 66, "style": "light", "anim": "settle", "label": "3 errori · 1 minuto", "size": 88,
      "lines": [[["IL TUO REEL MUORE", "n"]], [["IN 3 SECONDI", "n"], ["?", "dot"]]] },
    { "from": 66, "to": 130, "style": "dark", "anim": "flip", "label": "Video che girano", "size": 96, "block_at": 110,
      "lines": [[["ECCO", "n"]], [["PERCHÉ", "b"], [".", "dot"]]] },
    { "from": 184, "to": 230, "style": "light", "num": 1, "label": "ERRORE 1 · 1/3",
      "lines": [[["NIENTE ", "n"], ["HOOK", "p"], [".", "dot"]]] }
  ],
  // parts: "n" normal · "p" accent text · "b" accent block (white text) · "dot" accent full stop
  // style: light | dark | accent      anim: drop (default) | flip | settle
  "punches": [66, 200],                      // quick zoom-in + micro shake on key words
  "behind": [                                // OPTIONAL text behind the person (needs matte.py first)
    { "from": 574, "to": 612, "lines": [[["OPINIONI", "n"]]], "size": 230, "y": 260, "matte_dir": "matte_a3" }
  ],
  "scenes": [                                // explainer scenes (see explainer-scenes skill for every type + props)
    { "type": "checklist", "from": 230, "to": 330, "n": 1, "tag": "ERRORE 1",
      "props": { "headline": "I PRIMI *3 SECONDI*.", "items": [
        { "text": "Logo animato", "at": 240, "bad": true },
        { "text": "\"Ciao a tutti\"", "at": 262, "bad": true },
        { "text": "Il risultato subito", "at": 290 } ] } }
  ],
  "captions": { "keywords": ["hook", "secondi", "clienti"], "top": 1330, "hide_in_questions": true },
  "end": {                                   // null = no end card
    "dur": 105,
    "chips": [["ERRORE 1", true], ["ERRORE 2", true], ["ERRORE 3", false]],
    "label": "Vuoi il terzo?",
    "lines": [[["LA PARTE 2", "n"]], [["TE LA MANDIAMO", "n"]], [["NOI", "p"], [".", "dot"]]],
    "cta_label": "Commenta", "keyword": "HOOK", "sub": "e ti arriva in DM. Gratis."
  },
  "cover": {
    "image": "cover_cut.png", "scale": 1.08, "origin": "0px 0px", "label": "@handle",
    "pills": ["VIDEO CHE GIRANO", "SALVALO"],
    "lines": [[["3 ERRORI CHE", "n"]], [["UCCIDONO", "b"]], [["IL TUO REEL", "n"], [".", "dot"]]],
    "sub": "",
    "stickers": [ { "icon": "eye", "big": "248K", "small": "views", "x": 40, "y": 760, "rot": -8 },
                  { "icon": "heart", "big": "12K", "x": 760, "y": 1180, "rot": 6, "style": "accent" } ]
  },
  "music": { "enabled": true, "bpm": 112, "file": null, "gain": 0.30 }
}
```

## Layout safe zones (1080×1920)
- Top 0–110 and bottom 1600–1920 are covered by Instagram/TikTok UI: no important text there.
- Right 120 px from y 900 down: the like/comment column.
- Cards: top 118. Captions: top 1330 (move to 1250 if the speaker's hands/body area is busy). Scenes use 150–1300.
- Questions panel window: x 270, y 760, 540×960.

## Icons available
eye, heart, bubble, plane, check, x, lock, play, bookmark, search, user, bell, cart, arrow.
