#!/usr/bin/env bash
# Renders assets/icon/icon.svg to the PNG, .icns (macOS) and .ico (Windows)
# files the app and the installers use. Needs a headless Chrome/Chromium
# (set CHROME=/path/to/chrome) plus macOS sips and iconutil.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-$(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-*/chrome-headless-shell 2>/dev/null | tail -1)}"
OUT=assets/icon
TMP=$(mktemp -d)

"$CHROME" --headless --disable-gpu --hide-scrollbars --default-background-color=00000000 \
  --window-size=1024,1024 --screenshot="$OUT/icon.png" "file://$PWD/$OUT/icon.svg" >/dev/null 2>&1

# macOS .icns
mkdir -p "$TMP/icon.iconset"
for size in 16 32 128 256 512; do
  sips -z $size $size "$OUT/icon.png" --out "$TMP/icon.iconset/icon_${size}x${size}.png" >/dev/null
  sips -z $((size * 2)) $((size * 2)) "$OUT/icon.png" --out "$TMP/icon.iconset/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns "$TMP/icon.iconset" -o "$OUT/icon.icns"

# Windows .ico (PNG entries)
for size in 16 24 32 48 64 128 256; do
  sips -z $size $size "$OUT/icon.png" --out "$TMP/ico-$size.png" >/dev/null
done
python3 -I - "$TMP" "$OUT/icon.ico" <<'PY'
import struct, sys, os
tmp, out = sys.argv[1], sys.argv[2]
sizes = [16, 24, 32, 48, 64, 128, 256]
blobs = [open(os.path.join(tmp, f"ico-{s}.png"), "rb").read() for s in sizes]
header = struct.pack("<HHH", 0, 1, len(sizes))
offset = 6 + 16 * len(sizes)
entries = b""
for s, b in zip(sizes, blobs):
    entries += struct.pack("<BBBBHHII", s % 256, s % 256, 0, 0, 1, 32, len(b), offset)
    offset += len(b)
open(out, "wb").write(header + entries + b"".join(blobs))
PY

rm -rf "$TMP"
echo "Icons written to $OUT"
