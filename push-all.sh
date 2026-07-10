#!/bin/bash
# push-all.sh — 一键推送所有内容到 GitHub
#   - Securemetric 分支：测试代码
#   - main 分支：wiki 文档

set -e

echo "===== 1/2 推送 Securemetric（测试代码）====="
git push origin Securemetric

echo ""
echo "===== 2/2 推送 main（Wiki 文档）====="
git checkout main
git push origin main
git checkout Securemetric

echo ""
echo "===== 全部推送完成 ====="
echo "  GitHub: https://github.com/kennyzang/CRM_SM"
