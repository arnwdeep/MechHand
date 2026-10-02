"""Extract a scroll-scrub frame sequence from a video master.

Called by build-media.sh. Frames are WebP, not AVIF: during a scrub the browser
decodes 30-60 frames a second, and AVIF decode is markedly slower than WebP.
Compression ratio is not the binding constraint here — decode latency is.

Two sets are produced. Phones get fewer, smaller frames: scrubbing is jankier
on mobile and memory is tighter, and nobody compares the two side by side.
"""

from __future__ import annotations

import io
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

# (name, width, height, webp quality, keep every Nth extracted frame)
SETS = [
    ("desktop", 1280, 720, 78, 1),
    ("mobile", 854, 480, 75, 2),
]

# The master is 24fps; every 2nd frame is 12fps, which is smooth under scroll
# and halves both payload and decode work.
MASTER_STRIDE = 2

FILTER = "hqdn3d=1.5:1.5:6:6,unsharp=5:5:0.7:5:5:0.0"


def build(master: Path, out_dir: Path) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest: dict = {"sets": {}}

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            [
                "ffmpeg", "-v", "error", "-i", str(master),
                "-vf", f"{FILTER},select='not(mod(n\\,{MASTER_STRIDE}))'",
                "-fps_mode", "passthrough",
                f"{tmp}/f_%04d.png",
            ],
            check=True,
        )
        pngs = sorted(Path(tmp).glob("*.png"))
        if not pngs:
            raise SystemExit(f"no frames extracted from {master}")

        for name, w, h, quality, stride in SETS:
            chosen = pngs[::stride]
            set_dir = out_dir / name
            set_dir.mkdir(exist_ok=True)
            for old in set_dir.glob("*.webp"):
                old.unlink()

            total = 0
            for index, png in enumerate(chosen):
                img = Image.open(png).convert("RGB").resize((w, h), Image.LANCZOS)
                buf = io.BytesIO()
                img.save(buf, "WEBP", quality=quality, method=6)
                data = buf.getvalue()
                total += len(data)
                (set_dir / f"{index:04d}.webp").write_bytes(data)

            manifest["sets"][name] = {
                "count": len(chosen),
                "width": w,
                "height": h,
                "bytes": total,
            }
            print(
                f"    {name:<8} {len(chosen):>3} frames  "
                f"{total / 1048576:>5.2f} MB  ({total / len(chosen) / 1024:.1f} KB avg)"
            )

    return manifest


if __name__ == "__main__":
    master, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    manifest = build(master, out_dir)
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
