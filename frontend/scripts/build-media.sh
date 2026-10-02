#!/usr/bin/env bash
# Build web-ready hero media from a video master.
#
#   ./scripts/build-media.sh                 # all masters in ../media-src
#   ./scripts/build-media.sh hero-01.mp4     # just one
#
# Masters live in media-src/ at the repo root and are NOT committed (too large).
# Everything this produces lands in public/media/hero/ and IS committed, because
# it is what the site serves.
#
# The enhancement filter is deliberate, not a default: the masters are 720p and
# read soft at hero size, so a light denoise + unsharp recovers apparent detail
# on stones and metal. Confirmed against the alternative on 2026-09-20 —
# see the sharpen A/B in media-preview/. Applied to BOTH encodes so AV1 and
# H.264 viewers see the same picture.

set -euo pipefail
cd "$(dirname "$0")/.."

SRC_DIR="../media-src"
OUT_DIR="public/media/hero"
FILTER="hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.7:5:5:0.0"

command -v ffmpeg >/dev/null || { echo "ffmpeg not found — brew install ffmpeg" >&2; exit 1; }
mkdir -p "$OUT_DIR"

masters=("$@")
if [ ${#masters[@]} -eq 0 ]; then
  masters=()
  while IFS= read -r f; do masters+=("$(basename "$f")"); done < <(find "$SRC_DIR" -maxdepth 1 -name '*.mp4' | sort)
fi

for m in "${masters[@]}"; do
  src="$SRC_DIR/$m"
  name="${m%.*}"
  [ -f "$src" ] || { echo "missing: $src" >&2; exit 1; }
  echo "==> $m"

  # Poster: first meaningful frame, shown instantly while the video loads.
  # Taken through the same filter so it does not visibly swap on play.
  ffmpeg -v error -ss 0.5 -i "$src" -vf "$FILTER" -frames:v 1 \
    -y "$OUT_DIR/$name-poster.png"
  if command -v magick >/dev/null; then
    magick "$OUT_DIR/$name-poster.png" -quality 62 "$OUT_DIR/$name-poster.avif"
  else
    python3 - "$OUT_DIR/$name-poster" <<'PY' || echo "  (poster left as PNG — pip install pillow pillow-avif-plugin for AVIF)"
import sys
from PIL import Image
import pillow_avif  # noqa: F401
base = sys.argv[1]
Image.open(base + ".png").convert("RGB").save(base + ".avif", "AVIF", quality=62)
PY
  fi
  rm -f "$OUT_DIR/$name-poster.png"

  # stat, not du: on APFS du reports allocated blocks and overstates by ~40%.
  # Scroll-scrub frame sequence. The hero is scrubbed by scroll position, which
  # needs random access to any frame — a video element cannot seek reliably
  # enough for that (this master has one keyframe in 8 seconds).
  echo "    frames:"
  python3 scripts/build_frames.py "$src" "$OUT_DIR/$name-frames"

  for suffix in -poster.avif; do
    f="$OUT_DIR/$name$suffix"
    [ -f "$f" ] || continue
    bytes=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f")
    printf "    %7.2f MB  %s\n" "$(echo "scale=4; $bytes/1048576" | bc)" "$(basename "$f")"
  done
done
echo "Done."
