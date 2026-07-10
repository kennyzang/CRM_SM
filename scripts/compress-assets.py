#!/usr/bin/env python3
"""
Compress wiki/assets images in-place using Pillow.

PNG  → 256-color palette quantization (Floyd-Steinberg dither) — typically 60-75% smaller
JPG  → quality 85 re-encode, strip EXIF                        — typically 20-40% smaller

Only writes the file back if the compressed version is actually smaller.

Usage:
    python3 scripts/compress-assets.py
    python3 scripts/compress-assets.py --dry-run   # preview only, no writes
"""

import argparse
import io
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

ASSETS_DIR = Path(__file__).resolve().parent.parent / "wiki" / "assets"

PNG_COLORS  = 256   # palette size for quantization
JPG_QUALITY = 85    # 0-95; 85 is a safe perceptual-lossless point


def compress_png(path: Path, dry_run: bool) -> tuple[int, int]:
    orig_bytes = path.read_bytes()
    orig_size = len(orig_bytes)

    img = Image.open(io.BytesIO(orig_bytes)).convert("RGB")
    quantized = img.quantize(
        colors=PNG_COLORS,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.FLOYDSTEINBERG,
    )

    buf = io.BytesIO()
    quantized.save(buf, format="PNG", optimize=True)
    new_size = len(buf.getvalue())

    if new_size < orig_size and not dry_run:
        path.write_bytes(buf.getvalue())

    return orig_size, new_size


def compress_jpg(path: Path, dry_run: bool) -> tuple[int, int]:
    orig_bytes = path.read_bytes()
    orig_size = len(orig_bytes)

    img = Image.open(io.BytesIO(orig_bytes)).convert("RGB")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=JPG_QUALITY, optimize=True)
    new_size = len(buf.getvalue())

    if new_size < orig_size and not dry_run:
        path.write_bytes(buf.getvalue())

    return orig_size, new_size


def human(n: int) -> str:
    return f"{n / 1024:.1f} KB"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="Show savings without writing files")
    args = parser.parse_args()

    if not ASSETS_DIR.exists():
        sys.exit(f"Assets directory not found: {ASSETS_DIR}")

    files = sorted(ASSETS_DIR.iterdir())
    total_orig = total_new = 0
    skipped = 0

    label = "[DRY RUN] " if args.dry_run else ""
    print(f"{label}Compressing images in {ASSETS_DIR}\n")
    print(f"{'File':<45} {'Before':>9} {'After':>9} {'Saved':>7}")
    print("-" * 75)

    for f in files:
        suffix = f.suffix.lower()
        if suffix == ".png":
            orig, new = compress_png(f, args.dry_run)
        elif suffix in (".jpg", ".jpeg"):
            orig, new = compress_jpg(f, args.dry_run)
        else:
            continue

        total_orig += orig
        if new < orig:
            total_new += new
            saved_pct = (1 - new / orig) * 100
            marker = "" if args.dry_run else "✓"
            print(f"{marker} {f.name:<43} {human(orig):>9} {human(new):>9} {saved_pct:>6.0f}%")
        else:
            total_new += orig
            skipped += 1
            print(f"  {f.name:<43} {human(orig):>9} {'(skip)':>9}")

    print("-" * 75)
    if total_orig > 0:
        overall_pct = (1 - total_new / total_orig) * 100
        print(f"{'TOTAL':<45} {human(total_orig):>9} {human(total_new):>9} {overall_pct:>6.0f}%")

    if args.dry_run:
        print("\nDry run — no files were modified. Remove --dry-run to apply.")
    else:
        print(f"\nDone. {skipped} file(s) skipped (already optimal or unsupported).")


if __name__ == "__main__":
    main()
