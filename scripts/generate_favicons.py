#!/usr/bin/env python3
"""
Favicon generator.

Source of truth:  icons/logo.svg  (hand-edited — your master logo)
Generated files:  icons/favicon.svg          (logo.svg with tight viewBox)
                  icons/favicon-16.png
                  icons/favicon-32.png
                  icons/apple-touch-icon.png (180x180)
                  icons/favicon.ico          (multi-size: 16, 32, 48)

Run after editing logo.svg. The logo's inner content (paths, colors,
groups) is preserved byte-for-byte — the script only rewrites the outer
<svg> tag's viewBox/width/height to crop the A4 whitespace Inkscape
tends to leave around the artwork.

Requires: ImageMagick (`magick` on PATH).
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "icons"
SOURCE = ICONS_DIR / "logo.svg"

# Render density for rasterization. Higher = sharper PNGs but slower.
DENSITY = 300


def require_magick() -> None:
    if shutil.which("magick") is None:
        sys.exit("error: ImageMagick ('magick') not found on PATH.")


def read_source_viewbox(svg: str) -> tuple[float, float, float, float]:
    """Return (min_x, min_y, width, height) of the source SVG's viewBox."""
    m = re.search(r"viewBox=\"([\d.\-\s]+)\"", svg)
    if m:
        parts = [float(p) for p in m.group(1).split()]
        if len(parts) == 4:
            return tuple(parts)  # type: ignore[return-value]
    w = re.search(r"width=\"([\d.]+)mm\"", svg)
    h = re.search(r"height=\"([\d.]+)mm\"", svg)
    if w and h:
        return (0.0, 0.0, float(w.group(1)), float(h.group(1)))
    sys.exit("error: could not determine source SVG dimensions.")


def detect_content_bbox(source_svg: Path) -> tuple[int, int, int, int, int, int]:
    """Rasterize, trim, and return (x, y, w, h, canvas_w, canvas_h) in pixels."""
    result = subprocess.run(
        [
            "magick",
            "-background", "none",
            "-density", str(DENSITY),
            str(source_svg),
            "-trim",
            "-format", "%w %h %W %H %X %Y",
            "info:",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    parts = result.stdout.strip().split()
    w, h = int(parts[0]), int(parts[1])
    canvas_w, canvas_h = int(parts[2]), int(parts[3])
    x = int(parts[4].lstrip("+"))
    y = int(parts[5].lstrip("+"))
    return x, y, w, h, canvas_w, canvas_h


def compute_tight_viewbox(
    bbox_px: tuple[int, int, int, int, int, int],
    source_vb: tuple[float, float, float, float],
) -> tuple[float, float, float, float]:
    """Convert pixel-space content bbox to the source SVG's coordinate
    system, then expand to a centered square (favicons want 1:1)."""
    x_px, y_px, w_px, h_px, canvas_w_px, canvas_h_px = bbox_px
    vb_x, vb_y, vb_w, vb_h = source_vb

    sx = canvas_w_px / vb_w
    sy = canvas_h_px / vb_h

    x = vb_x + x_px / sx
    y = vb_y + y_px / sy
    w = w_px / sx
    h = h_px / sy

    side = max(w, h)
    cx = x + w / 2
    cy = y + h / 2
    return (cx - side / 2, cy - side / 2, side, side)


def rewrite_outer_svg_tag(svg_text: str, tight_vb: tuple[float, float, float, float]) -> str:
    """Replace viewBox on the outer <svg> tag and strip width/height so
    browsers scale to whatever surface renders the icon. Everything
    inside the SVG (paths, styles, groups, metadata) is untouched."""
    match = re.search(r"<svg\b[^>]*>", svg_text)
    if not match:
        sys.exit("error: could not find outer <svg> tag in logo.svg.")

    tag = match.group(0)
    vb_attr = 'viewBox="{:.3f} {:.3f} {:.3f} {:.3f}"'.format(*tight_vb)

    # Replace or insert viewBox
    if re.search(r'viewBox="[^"]*"', tag):
        new_tag = re.sub(r'viewBox="[^"]*"', vb_attr, tag)
    else:
        new_tag = tag[:-1].rstrip() + f" {vb_attr}>"

    # Drop width/height so the SVG scales to its container rather than
    # forcing physical mm dimensions. Keep namespace/other attrs intact.
    new_tag = re.sub(r'\s+width="[^"]*"', "", new_tag)
    new_tag = re.sub(r'\s+height="[^"]*"', "", new_tag)

    return svg_text[: match.start()] + new_tag + svg_text[match.end():]


def write_favicon_svg(svg_text: str) -> Path:
    out = ICONS_DIR / "favicon.svg"
    out.write_text(svg_text)
    return out


def rasterize(src: Path, size: int, out: Path) -> None:
    subprocess.run(
        [
            "magick",
            "-background", "none",
            "-density", str(DENSITY),
            str(src),
            "-resize", f"{size}x{size}",
            str(out),
        ],
        check=True,
    )


def build_ico(src_svg: Path, out: Path) -> None:
    """Bundle 16/32/48 PNGs into a multi-resolution ICO."""
    sizes = (16, 32, 48)
    tmp_pngs = [ICONS_DIR / f".tmp-ico-{s}.png" for s in sizes]
    try:
        for size, tmp in zip(sizes, tmp_pngs):
            rasterize(src_svg, size, tmp)
        subprocess.run(["magick", *[str(p) for p in tmp_pngs], str(out)], check=True)
    finally:
        for tmp in tmp_pngs:
            tmp.unlink(missing_ok=True)


def main() -> None:
    require_magick()

    if not SOURCE.exists():
        sys.exit(f"error: {SOURCE} not found.")

    svg_text = SOURCE.read_text()
    source_vb = read_source_viewbox(svg_text)
    bbox = detect_content_bbox(SOURCE)
    tight_vb = compute_tight_viewbox(bbox, source_vb)

    print(f"source viewBox: {source_vb}")
    print(f"content bbox (px): {bbox[:4]} on {bbox[4]}x{bbox[5]} canvas")
    print(f"tight viewBox: {tuple(round(v, 2) for v in tight_vb)}")

    favicon_svg_text = rewrite_outer_svg_tag(svg_text, tight_vb)
    favicon_svg = write_favicon_svg(favicon_svg_text)
    print(f"✓ wrote {favicon_svg.relative_to(ROOT)}")

    rasterize(favicon_svg, 16, ICONS_DIR / "favicon-16.png")
    print("✓ wrote icons/favicon-16.png")
    rasterize(favicon_svg, 32, ICONS_DIR / "favicon-32.png")
    print("✓ wrote icons/favicon-32.png")
    rasterize(favicon_svg, 180, ICONS_DIR / "apple-touch-icon.png")
    print("✓ wrote icons/apple-touch-icon.png")
    build_ico(favicon_svg, ICONS_DIR / "favicon.ico")
    print("✓ wrote icons/favicon.ico")


if __name__ == "__main__":
    main()
