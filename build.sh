#!/bin/bash
# build.sh
# Pack MK portal widgets into a zip and open the MK platform upload page.
#
# Usage:
#   ./build.sh          # pack km-ltc-manual-securemetric  (Playwright screenshot manual)
#   ./build.sh wiki     # pack km-ltc-wiki-securemetric    (wiki knowledge base)
#
# Output: ./dist/<component-name>-<timestamp>.zip
# The zip contains a top-level folder matching the component name,
# as required by the MK platform upload system.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"
UPLOAD_URL="http://172.18.114.231:8088/web/#/manage/sys-portal/manage/resource/material/diy/widget"

# ── Mode selection ──────────────────────────────────────────────────────────
TARGET="${1:-manual}"

if [ "$TARGET" = "wiki" ]; then
  COMPONENT_NAME="km-ltc-wiki-securemetric"
  MODE="wiki"
else
  COMPONENT_NAME="km-ltc-manual-securemetric"
  MODE="manual"
fi

ZIP_NAME="${COMPONENT_NAME}-$(date +%Y%m%d%H%M%S).zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

echo ""
echo "Mode    : $MODE"
echo "Component: $COMPONENT_NAME"
echo "Output  : $ZIP_PATH"
echo ""

# ── 1. 清空 dist 目录 ──────────────────────────────────────────────────────
echo "Clearing dist directory..."
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# ── 2. 打包 ────────────────────────────────────────────────────────────────
FOLDER_DIR="$DIST_DIR/$COMPONENT_NAME"

if [ "$MODE" = "manual" ]; then
  # ── manual 模式：复制原组件目录到 dist/，再打包 ──────────────────────────
  WIDGET_DIR="$SCRIPT_DIR/src/widget/km-ltc-manual-securemetric"
  cp -r "$WIDGET_DIR" "$FOLDER_DIR"
  # 清理 dist 文件夹内的系统文件
  find "$FOLDER_DIR" -name ".DS_Store" -delete

else
  # ── wiki 模式：动态组装到 dist/，零重复 ──────────────────────────────────
  MANUAL_WIDGET_DIR="$SCRIPT_DIR/src/widget/km-ltc-manual-securemetric"
  WIKI_WIDGET_DIR="$SCRIPT_DIR/wiki/widget/km-ltc-wiki-securemetric"
  WIKI_OUTPUT_DIR="$SCRIPT_DIR/wiki/docs/output"

  # 检查 wiki/docs/output 是否存在
  if [ ! -d "$WIKI_OUTPUT_DIR" ]; then
    echo "Error: wiki/docs/output not found. Run 'npm run wiki:docs' first."
    exit 1
  fi

  mkdir -p "$FOLDER_DIR/locale"
  mkdir -p "$FOLDER_DIR/sample/thumbnail"

  echo "Assembling component..."

  # 来自 wiki/widget/km-ltc-wiki-securemetric/（wiki 专属文件）
  for f in config.json index.js index.json meta.json style.css; do
    cp "$WIKI_WIDGET_DIR/$f" "$FOLDER_DIR/"
    echo "  [ok] $f  ← wiki/widget/km-ltc-wiki-securemetric/"
  done

  # sample/ — 缩略图 + sample.json（wiki 专属）
  cp "$WIKI_WIDGET_DIR/sample/sample.json" "$FOLDER_DIR/sample/"
  cp "$WIKI_WIDGET_DIR/sample/thumbnail/desktop.png" "$FOLDER_DIR/sample/thumbnail/"
  echo "  [ok] sample/      ← wiki/widget/km-ltc-wiki-securemetric/"

  # locale/ — 复用原 manual 组件（不在仓库中重复存储）
  cp -r "$MANUAL_WIDGET_DIR/locale/." "$FOLDER_DIR/locale/"
  echo "  [ok] locale/      ← src/widget/km-ltc-manual-securemetric/"

  # 静态文档站直接部署到组件根目录（index.html 在根）
  cp -r "$WIKI_OUTPUT_DIR/." "$FOLDER_DIR/"
  echo "  [ok] docs/        ← wiki/docs/output/ (index.html at root)"

  echo ""
fi

# ── 从 dist/ 父级打包（zip 输出在 dist/ 内，源文件夹也在 dist/ 内，用父级避免冲突）──
ASSEMBLY_BASE="$(mktemp -d)"
cp -r "$FOLDER_DIR" "$ASSEMBLY_BASE/"
cd "$ASSEMBLY_BASE"
zip -r "$ZIP_PATH" "$COMPONENT_NAME/" \
  --exclude "*/.DS_Store" \
  --exclude "*/__MACOSX/*" \
  --exclude "*/node_modules/*"
rm -rf "$ASSEMBLY_BASE"

# ── 3. 结果报告 ────────────────────────────────────────────────────────────
SIZE=$(du -sh "$ZIP_PATH" | cut -f1)
echo "Done. File: $ZIP_PATH ($SIZE)"
echo ""

echo "Zip contents (top 20 entries):"
unzip -l "$ZIP_PATH" | head -25
echo ""

# ── 4. 打开上传页面 ────────────────────────────────────────────────────────
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
