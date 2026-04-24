#!/usr/bin/env python3
"""
Favicon generator.

Source of truth:  icons/logo.svg  (hand-edited — your master logo)
Generated files:  icons/favicon.svg          (tight viewBox, theme-aware fill)
                  icons/favicon-16.png
                  icons/favicon-32.png
                  icons/apple-touch-icon.png (180x180)
                  icons/favicon.ico          (multi-size: 16, 32, 48)

Run this script whenever logo.svg changes. It auto-detects the content
bounding box so the output stays tight regardless of how the logo is
positioned inside its canvas in Inkscape.

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

# Colors for the theme-aware favicon SVG. These match the site palette
# (--bg-primary for light OS/browser chrome, --text-light for dark).
FILL_LIGHT = "#1a1e23"
FILL_DARK = "#e4e9ec"

# Render density for rasterization. Higher = sharper PNGs but slower.
DENSITY = 300


def require_magick() -> None:
    if shutil.which("magick") is None:
        sys.exit("error: ImageMagick ('magick') not found on PATH.")


def read_source_svg() -> str:
    if not SOURCE.exists():
        sys.exit(f"error: {SOURCE} not found.")
    return SOURCE.read_text()


def extract_path_d(svg: str) -> str:
    """Pull the `d` attribute from the first <path> element."""
    m = re.search(r"<path[^>]*\sd=\"([^\"]+)\"", svg, flags=re.DOTALL)
    if not m:
        sys.exit("error: no <path d=\"...\"> element found in logo.svg.")
    return m.group(1)


def read_source_viewbox(svg: str) -> tuple[float, float, float, float]:
    """Return (min_x, min_y, width, height) of the source SVG's viewBox."""
    m = re.search(r"viewBox=\"([\d.\-\s]+)\"", svg)
    if m:
        parts = [float(p) for p in m.group(1).split()]
        if len(parts) == 4:
            return tuple(parts)  # type: ignore[return-value]
    # Fallback: width/height in mm (Inkscape default)
    w = re.search(r"width=\"([\d.]+)mm\"", svg)
    h = re.search(r"height=\"([\d.]+)mm\"", svg)
    if w and h:
        return (0.0, 0.0, float(w.group(1)), float(h.group(1)))
    sys.exit("error: could not determine source SVG dimensions.")


def detect_content_bbox(source_svg: Path) -> tuple[int, int, int, int, int, int]:
    """Rasterize the source, trim, and return (x, y, w, h, canvas_w, canvas_h)
    all in pixel coordinates of the rendered raster."""
    # Use `identify -format %@` on a trimmed render to get the tight bbox.
    # %@ is ImageMagick shorthand for "WxH+X+Y" of the minimum bounding box.
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
    # %w %h = trimmed size; %W %H = canvas size; %X %Y = trim origin offsets
    # Note: %X/%Y come back as "+N" strings, so strip the sign marker.
    parts = result.stdout.strip().split()
    w, h, canvas_w, canvas_h = int(parts[0]), int(parts[1]), int(parts[2]), int(parts[3])
    x = int(parts[4].lstrip("+"))
    y = int(parts[5].lstrip("+"))
    return x, y, w, h, canvas_w, canvas_h


def compute_tight_viewbox(
    bbox_px: tuple[int, int, int, int, int, int],
    source_vb: tuple[float, float, float, float],
) -> tuple[float, float, float, float]:
    """Convert the pixel-space content bbox back to the source SVG's
    coordinate system, then expand to a centered square (favicons want 1:1)."""
    x_px, y_px, w_px, h_px, canvas_w_px, canvas_h_px = bbox_px
    vb_x, vb_y, vb_w, vb_h = source_vb

    # Pixels-per-unit scale factors
    sx = canvas_w_px / vb_w
    sy = canvas_h_px / vb_h

    # Convert content bbox into viewBox units
    x = vb_x + x_px / sx
    y = vb_y + y_px / sy
    w = w_px / sx
    h = h_px / sy

    # Expand to a square centered on the content so favicons render 1:1.
    side = max(w, h)
    cx = x + w / 2
    cy = y + h / 2
    return (cx - side / 2, cy - side / 2, side, side)


def write_favicon_svg(path_d: str, viewbox: tuple[float, float, float, float]) -> Path:
    """Emit the compact, theme-aware favicon SVG."""
    vb = " ".join(f"{v:.3f}" for v in viewbox)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">
  <style>
    path {{ fill: {FILL_LIGHT}; }}
    @media (prefers-color-scheme: dark) {{
      path {{ fill: {FILL_DARK}; }}
    }}
  </style>
  <path d="{path_d}"/>
</svg>
"""
    out = ICONS_DIR / "favicon.svg"
    out.write_text(svg)
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

    svg = read_source_svg()
    path_d = extract_path_d(svg)
    source_vb = read_source_viewbox(svg)
    bbox = detect_content_bbox(SOURCE)
    tight_vb = compute_tight_viewbox(bbox, source_vb)

    print(f"source viewBox: {source_vb}")
    print(f"content bbox (px): {bbox[:4]} on {bbox[4]}x{bbox[5]} canvas")
    print(f"tight viewBox: {tuple(round(v, 2) for v in tight_vb)}")

    favicon_svg = write_favicon_svg(path_d, tight_vb)
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
