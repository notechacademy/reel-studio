#!/usr/bin/env bash
# Reel Studio - one-time environment setup (idempotent: safe to run every session).
# Usage: bash setup.sh <work_dir> [brand.json]
#   - checks ffmpeg / python / node
#   - installs python deps, downloads speech models from GitHub releases
#   - creates the Remotion project in <work_dir>/reel from the template and npm-installs it
#   - downloads the brand fonts listed in brand.json into reel/public/fonts
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${1:?usage: setup.sh <work_dir> [brand.json]}"
BRAND="${2:-}"
MODELS="${REEL_MODELS:-$HOME/.reel-studio/models}"
mkdir -p "$WORK" "$MODELS"

say() { printf '\n== %s\n' "$*"; }

say "1/6 system tools"
for t in ffmpeg ffprobe python3 node npm; do
  if ! command -v "$t" >/dev/null 2>&1; then
    echo "MISSING: $t"
    if [ "$t" = ffmpeg ] || [ "$t" = ffprobe ]; then (apt-get install -y ffmpeg >/dev/null 2>&1 || sudo apt-get install -y ffmpeg >/dev/null 2>&1) || true; fi
  fi
done
command -v ffmpeg >/dev/null || { echo "ffmpeg not available: cannot continue"; exit 1; }
command -v node >/dev/null || { echo "node not available: cannot continue"; exit 1; }
FILTERS="$(ffmpeg -hide_banner -filters 2>/dev/null || true)"
case "$FILTERS" in *zscale*) echo "zscale OK (HDR tonemapping available)";; *) echo "WARNING: ffmpeg without zscale -> HDR iPhone footage will look washed out. Install a full ffmpeg build.";; esac

say "2/6 python packages"
PIP="pip install -q"
python3 -m pip --version >/dev/null 2>&1 || { echo "pip missing"; exit 1; }
$PIP numpy pillow opencv-python-headless sherpa-onnx 2>/dev/null || $PIP --break-system-packages numpy pillow opencv-python-headless sherpa-onnx
python3 -c "import rembg" 2>/dev/null || ($PIP "rembg[cpu]" 2>/dev/null || $PIP --break-system-packages "rembg[cpu]") || echo "rembg not installed (only needed for cover cut-out / text behind person)"

say "3/6 speech models (GitHub releases - HuggingFace is often blocked in sandboxes)"
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models
[ -f "$MODELS/silero_vad.onnx" ] || curl -sSL -o "$MODELS/silero_vad.onnx" "$REL/silero_vad.onnx"
if [ ! -d "$MODELS/parakeet" ]; then
  curl -sSL -o "$MODELS/pk.tar.bz2" "$REL/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2"
  tar xjf "$MODELS/pk.tar.bz2" -C "$MODELS" && rm "$MODELS/pk.tar.bz2"
  mv "$MODELS/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8" "$MODELS/parakeet"
fi
ls "$MODELS/parakeet" | grep -q encoder && echo "parakeet OK"

say "4/6 remotion project"
if [ ! -d "$WORK/reel/node_modules" ]; then
  mkdir -p "$WORK/reel"
  [ -f "$WORK/reel/package.json" ] || cp -r "$HERE/../template/." "$WORK/reel/"
  (cd "$WORK/reel" && npm install --no-audit --no-fund --loglevel=error)
fi
echo "remotion project: $WORK/reel"

say "5/6 browser for rendering"
B=""
for c in /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell /opt/pw-browsers/chromium-*/chrome-linux/chrome "$(command -v chromium 2>/dev/null)" "$(command -v google-chrome 2>/dev/null)"; do
  [ -n "$c" ] && [ -x "$c" ] && { B="$c"; break; }
done
if [ -n "$B" ]; then echo "export REMOTION_BROWSER=$B" > "$WORK/reel/.browser.env"; echo "using local browser: $B";
else (cd "$WORK/reel" && npx remotion browser ensure >/dev/null 2>&1 && echo "remotion downloaded its own browser") || echo "WARNING: no browser found"; fi

say "6/6 brand fonts"
if [ -n "$BRAND" ] && [ -f "$BRAND" ]; then
  cp "$BRAND" "$WORK/reel/src/data/brand.json"
  python3 - "$BRAND" "$WORK/reel/public/fonts" <<'PY'
import json, sys, urllib.request, os
b = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
for role in ("display", "body", "body_bold", "quote"):
    f = b["typography"].get(role)
    if not f: continue
    dst = os.path.join(out, f["file"])
    if os.path.exists(dst): continue
    if f.get("google"):
        url = "https://raw.githubusercontent.com/google/fonts/main/" + f["google"]
        urllib.request.urlretrieve(url, dst); print("font", role, "<-", url)
    elif f.get("local"):
        import shutil; shutil.copy(f["local"], dst); print("font", role, "<-", f["local"])
PY
else
  echo "no brand.json given yet (run brand-kit first, then re-run setup with it)"
fi
say "READY"
