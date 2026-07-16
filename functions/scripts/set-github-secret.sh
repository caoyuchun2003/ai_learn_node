#!/usr/bin/env bash
# 把 CFC 根地址写成 VITE_AI_API_BASE（自动拼 /ai/api）
set -euo pipefail

RAW="${1:-}"
if [[ -z "$RAW" ]]; then
  echo "用法: $0 'https://xxxx.cfc-execute.bj.baidubce.com'"
  exit 1
fi

BASE="${RAW%/}"
# 若已带 /ai/api 则不再追加
if [[ "$BASE" == */ai/api ]]; then
  VALUE="$BASE"
else
  VALUE="${BASE}/ai/api"
fi

echo "Setting VITE_AI_API_BASE=$VALUE"
gh secret set VITE_AI_API_BASE \
  --repo caoyuchun2003/ai_learn_node \
  --body "$VALUE"

echo "OK. 重新触发 Pages 部署："
echo "  gh workflow run 'Deploy frontend to GitHub Pages' --repo caoyuchun2003/ai_learn_node"
