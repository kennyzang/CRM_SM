#!/bin/bash
# deploy-widget.sh
# Pack the km-ltc-manual-securemetric widget into a zip and open the MK platform upload page.
#
# Usage:
#   bash deploy-widget.sh
#
# The zip contains a top-level folder (km-ltc-manual-securemetric/) to match
# the structure expected by the MK platform upload system.
# Output goes to ./dist/ (cleared on each run).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIDGET_DIR="$SCRIPT_DIR/src/widget/km-ltc-manual-securemetric"
WIDGET_FOLDER_NAME="km-ltc-manual-securemetric"
DIST_DIR="$SCRIPT_DIR/dist"
ZIP_NAME="km-ltc-manual-securemetric-$(date +%Y%m%d%H%M%S).zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"
UPLOAD_URL="http://172.18.114.231:8088/web/#/manage/sys-portal/manage/resource/material/diy/widget"

echo ""
echo "Packing widget..."
echo "  Source : $WIDGET_DIR"
echo "  Dist   : $DIST_DIR"
echo "  Output : $ZIP_PATH"
echo ""

# ── 1. 清空 dist 目录 ───────────────────────────────────────────────
echo "Clearing dist directory..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# ── 2. 打包：在父目录执行，使 zip 内包含顶层文件夹 ──────────────────
#   zip 结构: km-ltc-manual-securemetric/index.js
#             km-ltc-manual-securemetric/docs/...
cd "$WIDGET_DIR/.."

zip -r "$ZIP_PATH" "$WIDGET_FOLDER_NAME/" \
  --exclude "*/.DS_Store" \
  --exclude "*/__MACOSX/*" \
  --exclude "*/node_modules/*"

SIZE=$(du -sh "$ZIP_PATH" | cut -f1)
echo ""
echo "Done. File: $ZIP_PATH ($SIZE)"
echo ""

# ── 3. 验证顶层目录结构 ──────────────────────────────────────────────
echo "Zip contents (top 15 entries):"
unzip -l "$ZIP_PATH" | head -20
echo ""

echo "Opening MK platform upload page..."
echo "  $UPLOAD_URL"
echo ""

if command -v open &>/dev/null; then
  open "$UPLOAD_URL"
elif command -v xdg-open &>/dev/null; then
  xdg-open "$UPLOAD_URL"
else
  echo "Please open the URL above in your browser manually."
fi

echo "Upload the following file in the MK platform dialog:"
echo "  $ZIP_PATH"
echo ""
