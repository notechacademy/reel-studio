#!/usr/bin/env python3
"""Render a one-page brand book from brand.json.
usage: python3 build_brandbook.py brand.json <out_dir>   -> brandbook.html (+ brandbook.pdf if Chromium found)"""
import json, os, sys, shutil, subprocess, urllib.request, glob, html
b = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(f"{out}/fonts", exist_ok=True)
for role in ("display", "body", "quote"):
    f = b["typography"][role]; dst = f"{out}/fonts/{f['file']}"
    if not os.path.exists(dst):
        if f.get("google"): urllib.request.urlretrieve("https://raw.githubusercontent.com/google/fonts/main/" + f["google"], dst)
        elif f.get("local"): shutil.copy(f["local"], dst)
c = b["colors"]; t = b["typography"]; e = html.escape
dw = t["display"].get("weight", 400); up = "uppercase" if t.get("display_uppercase") else "none"
roles = [("background", "Sfondo principale (60%)"), ("surface", "Card, testo su scuro"), ("ink", "Titoli e testo"), ("dark", "Slide scure (30%)"),
         ("accent", "Accento: 1 parola, punti, CTA (10%)"), ("accent_dark", "Accento per testi piccoli"), ("accent_soft", "Glow e highlight"), ("muted", "Note, numeri pagina")]
sw = "".join(f'<div class="sw"><div class="chip" style="background:{c[k]}"></div><b>{k}</b><code>{c[k]}</code><small>{d}</small></div>' for k, d in roles)
v = b.get("voice", {}); cta = b.get("cta", {})
kw = (cta.get("keywords") or ["PAROLA"])[0]
H = f"""<!doctype html><html><head><meta charset="utf-8"><title>{e(b['name'])} · Brand book</title><style>
@font-face{{font-family:D;src:url(fonts/{t['display']['file']});font-weight:{dw}}}
@font-face{{font-family:Bo;src:url(fonts/{t['body']['file']});font-weight:100 900}}
@font-face{{font-family:Q;src:url(fonts/{t['quote']['file']});font-style:italic}}
body{{margin:0;background:{c['background']};color:{c['ink']};font-family:Bo,sans-serif}}
.page{{max-width:1100px;margin:0 auto;padding:70px 60px}}
.k{{font-weight:800;letter-spacing:.2em;font-size:13px;color:{c['accent_dark']};text-transform:uppercase}}
h1,h2{{font-family:D;font-weight:{dw};text-transform:{up};line-height:.98;margin:.2em 0}} h1{{font-size:96px}} h2{{font-size:48px;margin-top:70px}}
.a{{color:{c['accent']}}} .grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}
.sw{{background:#fff;border-radius:16px;overflow:hidden;padding-bottom:14px}} .chip{{height:110px}} .sw b,.sw code,.sw small{{display:block;padding:0 14px}} .sw b{{margin-top:10px}} .sw small{{color:{c['muted']}}}
.card{{background:{c['surface']};border-radius:20px;padding:26px}} .dark{{background:{c['dark']};color:{c['surface']};border-radius:24px;padding:40px}}
.blk{{background:{c['accent']};color:#fff;padding:0 .12em}} .strike{{text-decoration:line-through;text-decoration-color:{c['accent']};color:{c['muted']}}}
.q{{font-family:Q;font-style:italic;font-size:40px}} .circ{{display:inline-flex;width:70px;height:70px;border-radius:50%;border:4px solid {c['accent']};align-items:center;justify-content:center;font-family:D;font-size:34px;color:{c['accent_dark']}}}
.row{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}} .reel{{aspect-ratio:9/16;border-radius:24px;padding:28px;display:flex;flex-direction:column;justify-content:flex-end}}
</style></head><body><div class="page">
<div class="k">{e(b['name'])} · Social brand book</div><h1>{e(b.get('tagline','').rstrip('.'))}<span class="a">.</span></h1>
<h2>01 <span class="a">Colori</span></h2><div class="grid">{sw}</div><p>{e(b.get('proportions',''))}</p>
<h2>02 <span class="a">Font</span></h2><div class="row">
<div class="card"><div class="k">Titoli · hook</div><div style="font-family:D;font-weight:{dw};font-size:64px;text-transform:{up}">{e(t['display']['family'])}</div></div>
<div class="card"><div class="k">Testo · caption</div><div style="font-weight:800;font-size:52px">{e(t['body']['family'])}</div></div>
<div class="card"><div class="k">Citazioni</div><div class="q" style="font-size:56px">{e(t['quote']['family'])}</div></div></div>
<h2>03 <span class="a">Pattern</span></h2><div class="row">
<div class="card"><h1 style="font-size:54px">PAROLA <span class="a">CHIAVE.</span></h1><small>Una sola parola accento + punto accento.</small></div>
<div class="card"><h1 style="font-size:54px">IL <span class="blk">BLOCCO</span></h1><small>Sul video: parola chiave su blocco pieno.</small></div>
<div class="card"><span class="circ">01</span> <span class="circ" style="border-color:{c['muted']}">02</span><br><small>Cerchi numerati per step e liste.</small></div>
<div class="card"><h1 style="font-size:40px" class="strike">IL MITO</h1><h1 style="font-size:40px">LA VERITÀ<span class="a">.</span></h1></div>
<div class="card"><div class="q"><span class="a">“</span>Una frase vera, detta da voi.</div></div>
<div class="dark"><div class="k" style="color:{c['accent_soft']}">Slide scura</div><h1 style="font-size:48px">INSIGHT <span class="a">FORTE.</span></h1></div></div>
<h2>04 <span class="a">Tono</span> di voce</h2><div class="row">
<div class="card"><div class="k">Come parliamo</div><p>{e(', '.join(v.get('tone', [])))} · in prima persona: <b>{e(v.get('person',''))}</b></p></div>
<div class="card"><div class="k">Sì</div><p>{'<br>'.join(e(x) for x in v.get('do', []))}</p></div>
<div class="card"><div class="k">No</div><p class="strike">{'<br>'.join(e(x) for x in v.get('dont', []))}</p></div></div>
<h2>05 <span class="a">CTA</span></h2><div class="dark"><h1 style="font-size:64px">{e(cta.get('format','').replace('{KEYWORD}', kw))}</h1><p>{e(cta.get('promise',''))}</p><p>Keyword: {e(', '.join(cta.get('keywords', [])))}</p></div>
<h2>06 <span class="a">Template</span> reel</h2><div class="row">
<div class="reel" style="background:{c['background']};border:2px solid {c['ink']}"><div class="k">Hook</div><h1 style="font-size:44px">IL TITOLO CHE <span class="blk">FERMA</span><span class="a">.</span></h1></div>
<div class="reel" style="background:{c['dark']};color:{c['surface']}"><div class="k" style="color:{c['accent_soft']}">Domanda</div><h1 style="font-size:44px">VUOI PIÙ <span class="blk">CLIENTI?</span></h1></div>
<div class="reel" style="background:{c['dark']};color:{c['surface']}"><div class="k" style="color:{c['accent_soft']}">CTA</div><h1 style="font-size:40px">{e(cta.get('format','').split('{')[0])}<span class="a">{e(kw)}</span></h1></div></div>
</div></body></html>"""
open(f"{out}/brandbook.html", "w").write(H); print(f"{out}/brandbook.html")
cands = glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome") + [shutil.which(x) for x in ("chromium", "chromium-browser", "google-chrome") if shutil.which(x)]
if cands:
    subprocess.run([cands[0], "--headless", "--no-sandbox", "--disable-gpu", f"--print-to-pdf={out}/brandbook.pdf", "--no-pdf-header-footer", f"file://{os.path.abspath(out)}/brandbook.html"], capture_output=True)
    if os.path.exists(f"{out}/brandbook.pdf"): print(f"{out}/brandbook.pdf")
