# brand.json schema

```jsonc
{
  "name": "Nome Brand",               // shown on brand book
  "handle": "@handle",                // cover label
  "language": "it",                   // it | en | es | fr | de | pt ... (Parakeet supports 25 EU languages)
  "tagline": "Frase di posizionamento.",
  "colors": {
    "background":  "#EEF1EC",  // main light bg 60%
    "surface":     "#FAFBF8",  // cards on light bg, text on dark
    "ink":         "#121513",  // titles + text
    "dark":        "#0D110F",  // dark slides 30%
    "accent":      "#2F6BFF",  // THE accent 10% (white text must be readable on it)
    "accent_dark": "#1F4FD1",  // accent for small text on light bg
    "accent_soft": "#BFD3FF",  // glows / soft highlights / labels on dark
    "muted":       "#7C8580",  // notes, secondary
    "dark_glow":   "#16336F"   // radial glow tint on dark slides (accent mixed with dark)
  },
  "proportions": "60/30/10 rule in words",
  "typography": {
    "display": { "family": "Oswald", "file": "display.ttf", "google": "ofl/oswald/Oswald%5Bwght%5D.ttf", "variable": true, "weight": 600 },
    "display_uppercase": true,
    "body":    { "family": "DM Sans", "file": "body.ttf", "google": "ofl/dmsans/DMSans%5Bopsz,wght%5D.ttf", "variable": true },
    "body_bold": null,                 // only if body is NOT variable: { "file": "body-bold.ttf", "google": "..." } (weight 800)
    "quote":   { "family": "Instrument Serif", "file": "quote.ttf", "google": "ofl/instrumentserif/InstrumentSerif-Italic.ttf", "variable": false }
    // custom font uploaded by the user: replace "google" with "local": "/path/to/font.ttf"
  },
  "patterns": { "accent_word": "...", "accent_block": "...", "number_circle": "...", "strike": "...", "quote": "..." },
  "voice": { "person": "noi", "tone": ["..."], "do": ["..."], "dont": ["..."] },
  "cta": { "format": "Commenta {KEYWORD}", "promise": "La parte 2 te la mandiamo in DM.", "keywords": ["GUIDA"] },
  "pillars": [ { "name": "...", "keyword": "..." } ],
  "logo": null                         // or "logo.png" copied into reel/public/
}
```
File names `display.ttf`, `body.ttf`, `quote.ttf` are fixed: setup.sh downloads each font to that name.
