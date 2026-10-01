# Reel Studio

Plugin per Claude che trasforma un video grezzo (persona che parla in camera) in un reel montato da motion designer, **con i colori, i font e il tono del tuo brand**, per qualsiasi settore: coach, ristoranti, studi medici, agenzie, negozi, liberi professionisti.

Tu carichi il video e scrivi "montamelo". Claude:

- taglia tutti i silenzi, le pause e le ripetizioni;
- corregge i colori (anche i video HDR dell'iPhone, che di solito escono slavati);
- porta tutte le clip allo stesso volume;
- mette le caption parola per parola nello stile del brand;
- **aggiunge da solo le motion graphics che rappresentano quello che dici**, adattate al tuo argomento: titoli animati, step, liste, prima/dopo, numeri, grafici, citazioni, chat, notifiche, foto, registrazioni dello schermo, animazioni After Effects (Lottie);
- crea pannelli per le sezioni, zoom, effetti sonori e una musica originale;
- chiude con il finale con la call to action e prepara la copertina e la caption del post.

## Cosa c'è dentro

| Skill | Cosa fa | Come si attiva |
|---|---|---|
| **brand-kit** | Ti fa ~10 domande e crea il brand book (colori, font, pattern grafici, tono di voce, CTA) + il file `brand.json` che usano tutti i video | "Creami il brand book" |
| **reel-editor** | Monta il video dall'inizio alla fine | carichi il video + "montamelo" |
| **explainer-scenes** | Decide dove servono le grafiche e quali, in base a quello che dici | da solo, durante il montaggio |
| **reel-copy** | Testi a schermo, caption del post, hashtag, messaggio DM per la "parte 2" | da solo, o "scrivimi la caption" |
| **reel-qc** | Controllo qualità prima della consegna (colori, volume, peso, zone coperte da Instagram, faccia coperta…) | da solo, o "controlla il video" |

Remotion, i modelli per la trascrizione e i font **non vanno installati a mano**: la prima volta li scarica Claude (circa 3 minuti).

## Requisiti

- **Claude Cowork** con un ambiente che può eseguire codice, oppure **Claude Code**. Per controllare, chiedi a Claude: *"hai un terminale con ffmpeg e node? puoi ricevere un video da 80 MB?"*. Una chat normale senza esecuzione di codice non può montare video.
- Il video in verticale, **pulito**: senza scritte, senza sticker e senza video incollati sopra. Gli esempi (registrazioni schermo, foto, B-roll) vanno mandati come file separati.

## Installazione

**Claude Code**
```
/plugin marketplace add <utente-github>/reel-studio
/plugin install reel-studio@reel-studio
```

**Cowork**: Impostazioni → Plugin → aggiungi da GitHub (`<utente-github>/reel-studio`), oppure carica il file `reel-studio.plugin`.

## Come si usa

1. **"Creami il brand book"** → rispondi alle domande (logo, colori o sito, font, target, tono, CTA). Ricevi il brand book e il `brand.json`. Se lavori in un Progetto, viene salvato lì; altrimenti tienilo e allegalo ogni volta.
2. **Carica il video + "montamelo"**. Puoi aggiungere: registrazioni dello schermo, foto, un mp3 di musica con licenza, file Lottie, e istruzioni ("togli la parte in cui…").
3. Claude ti mostra il piano (cosa compare in ogni momento), costruisce il video, lo controlla e ti consegna **video + copertina + caption**.
4. Dai il tuo feedback: ogni correzione diventa una regola per i video successivi.

### Extra su richiesta
- **Testo dietro la persona**: "metti la scritta X dietro di me" (serve un'inquadratura ferma).
- **After Effects**: esporta l'animazione in Lottie (plugin gratuito Bodymovin/LottieFiles) e allegala.
- **Musica tua**: allega l'mp3 (con licenza). Altrimenti Claude usa una base originale senza copyright.

## Consigli per girare (cambiano molto il risultato)
- Una idea per clip; cambia inquadratura o stanza tra una sezione e l'altra.
- Prima di parlare, 1 secondo di silenzio sorridendo in camera (serve per la copertina).
- Occhi a circa 1/3 dall'alto: lo spazio sopra la testa serve per i titoli.
- Microfono vicino alla bocca, lo stesso per tutte le clip.
- Di' la struttura ad alta voce ("Errore numero 1…", "Primo step…"): diventa grafica.

## Struttura del repository
```
.claude-plugin/        plugin.json + marketplace.json
skills/brand-kit/      SKILL.md, references/ (domande, schema, font), scripts/ (palette, brand book), examples/demo-brand.json
skills/reel-editor/    SKILL.md, references/ (pipeline, schema edit, errori da evitare, troubleshooting, guida riprese)
                       scripts/ (setup, analyze, build_base, mix, matte, cutout, candidates)
                       template/ (progetto Remotion: caption, pannelli, card, scene, finale, copertina)
skills/explainer-scenes/  SKILL.md + catalogo scene
skills/reel-copy/      SKILL.md
skills/reel-qc/        SKILL.md + scripts/qc.py
```

## Note tecniche
- Trascrizione: Silero VAD + NVIDIA Parakeet TDT 0.6B v3 (25 lingue europee, con i tempi di ogni parola) via sherpa-onnx; modelli scaricati da GitHub.
- Video: Remotion 4 (React) + ffmpeg; colore HDR convertito in BT.709.
- Audio: voce a -15 LUFS, ogni clip livellata, musica che si abbassa quando parli, effetti sonori sintetizzati (nessun copyright).
- Brand demo incluso: "Nova Studio" (inventato). Sostituiscilo con il tuo tramite brand-kit.
