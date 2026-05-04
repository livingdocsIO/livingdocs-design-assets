#!/usr/bin/env python3

import argparse
import base64
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


DEFAULT_TARGETS = [
    Path("docs/site-2026/gsap/highlight-page-management-de/assets/stage-1.svg"),
    Path("docs/site-2026/gsap/highlight-page-management-de/assets/stage-2.svg"),
    Path("docs/site-2026/gsap/highlight-page-management-de/assets/stage-3.svg"),
    Path("docs/site-2026/gsap/highlight-page-management-en/assets/stage-1.svg"),
    Path("docs/site-2026/gsap/highlight-page-management-en/assets/stage-2.svg"),
    Path("docs/site-2026/gsap/highlight-page-management-en/assets/stage-3.svg"),
]

DATA_URI_RE = re.compile(r'data:image/([A-Za-z0-9.+-]+);base64,([^\"]+)', re.S)


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in [current, *current.parents]:
        if (candidate / ".git").exists():
            return candidate
    raise RuntimeError("Could not find repository root from script location")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Flatten and recompress embedded bitmap screenshots inside the page-management SVG assets."
        )
    )
    parser.add_argument(
        "files",
        nargs="*",
        help=(
            "Optional SVG files to optimize. Defaults to the six page-management DE/EN stage SVGs."
        ),
    )
    parser.add_argument(
        "--width",
        type=int,
        default=900,
        help="Resize embedded bitmap to this width in pixels before recompressing. Default: 900.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=68,
        help="JPEG quality to use for embedded screenshots. Default: 68.",
    )
    parser.add_argument(
        "--no-resize",
        action="store_true",
        help="Keep the original embedded bitmap size instead of resizing to --width.",
    )
    parser.add_argument(
        "--backup-ext",
        default=".bak",
        help="Write a backup of each modified SVG using this suffix. Use an empty string to disable. Default: .bak.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would change without writing files.",
    )
    return parser.parse_args()


def resolve_targets(repo_root: Path, raw_files: list[str]) -> list[Path]:
    if not raw_files:
        return [repo_root / path for path in DEFAULT_TARGETS]

    targets = []
    for raw in raw_files:
        candidate = Path(raw)
        if not candidate.is_absolute():
            candidate = repo_root / candidate
        targets.append(candidate.resolve())
    return targets


def decode_embedded_image(svg_text: str) -> tuple[re.Match[str], str, bytes]:
    match = DATA_URI_RE.search(svg_text)
    if not match:
        raise ValueError("No embedded base64 image found")
    mime_subtype = match.group(1).lower()
    image_bytes = base64.b64decode(match.group(2))
    return match, mime_subtype, image_bytes


def build_magick_command(source_path: Path, output_path: Path, width: int | None, quality: int) -> list[str]:
    command = [
        "magick",
        str(source_path),
        "-background",
        "white",
        "-alpha",
        "remove",
        "-alpha",
        "off",
    ]
    if width:
        command.extend(["-resize", f"{width}x"])
    command.extend(
        [
            "-strip",
            "-sampling-factor",
            "4:2:0",
            "-interlace",
            "Plane",
            "-quality",
            str(quality),
            str(output_path),
        ]
    )
    return command


def optimize_svg(svg_path: Path, width: int | None, quality: int, backup_ext: str, dry_run: bool) -> tuple[int, int]:
    svg_text = svg_path.read_text()
    match, mime_subtype, image_bytes = decode_embedded_image(svg_text)

    suffix = {
        "jpeg": ".jpg",
        "jpg": ".jpg",
        "png": ".png",
    }.get(mime_subtype, f".{mime_subtype}")

    with tempfile.TemporaryDirectory(prefix="svg-bitmap-opt-") as tmp_dir:
        tmp_path = Path(tmp_dir)
        source_image = tmp_path / f"embedded{suffix}"
        optimized_image = tmp_path / "embedded.jpg"
        source_image.write_bytes(image_bytes)

        command = build_magick_command(source_image, optimized_image, width, quality)
        subprocess.run(command, check=True)

        optimized_b64 = base64.b64encode(optimized_image.read_bytes()).decode("ascii")

    replacement = f"data:image/jpeg;base64,{optimized_b64}"
    updated_text = svg_text[: match.start()] + replacement + svg_text[match.end() :]

    original_size = len(svg_text.encode("utf-8"))
    optimized_size = len(updated_text.encode("utf-8"))

    if not dry_run:
        if backup_ext:
            backup_path = svg_path.with_name(svg_path.name + backup_ext)
            shutil.copy2(svg_path, backup_path)
        svg_path.write_text(updated_text)

    return original_size, optimized_size


def main() -> int:
    args = parse_args()
    repo_root = find_repo_root(Path(__file__).resolve().parent)
    targets = resolve_targets(repo_root, args.files)
    resize_width = None if args.no_resize else args.width

    if shutil.which("magick") is None:
        print("Error: ImageMagick 'magick' is required but was not found in PATH.", file=sys.stderr)
        return 1

    missing = [str(path) for path in targets if not path.exists()]
    if missing:
        print("Error: some target files do not exist:", file=sys.stderr)
        for path in missing:
            print(f"  - {path}", file=sys.stderr)
        return 1

    total_before = 0
    total_after = 0
    action = "Would optimize" if args.dry_run else "Optimized"

    for target in targets:
        before, after = optimize_svg(
            svg_path=target,
            width=resize_width,
            quality=args.quality,
            backup_ext=args.backup_ext,
            dry_run=args.dry_run,
        )
        total_before += before
        total_after += after
        delta = after - before
        print(f"{action} {target.relative_to(repo_root)}: {before} -> {after} bytes ({delta:+d})")

    print(f"Total: {total_before} -> {total_after} bytes ({total_after - total_before:+d})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())