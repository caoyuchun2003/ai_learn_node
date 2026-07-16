#!/usr/bin/env bash
# 部署 AI Learn CFC HTTPS 代理（bsam package + deploy）
set -euo pipefail

export PATH="${HOME}/Library/Python/3.9/bin:${HOME}/.local/bin:${PATH}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v bsam >/dev/null 2>&1; then
  echo "未找到 bsam。先安装并配置："
  echo "  pip3 install --user bce-sam-cli"
  echo "  pip3 install --user 'werkzeug<3'"
  echo "  bsam config --ak AK --sk SK --region bj"
  exit 1
fi

BCE_CREDS="${HOME}/.bce/credentials"
if [[ ! -f "$BCE_CREDS" ]]; then
  echo "未找到 ${BCE_CREDS}。先："
  echo "  bsam config --ak AK --sk SK --region bj"
  exit 1
fi

echo ">>> bsam package"
bsam package
echo ">>> bsam deploy"
bsam deploy

echo
echo "部署完成。下一步："
echo "  1) 控制台复制 HTTP 触发器根地址，例如："
echo "       https://xxxx.cfc-execute.bj.baidubce.com"
echo "  2) 设 GitHub Secret："
echo "       ./scripts/set-github-secret.sh 'https://xxxx.cfc-execute.bj.baidubce.com'"
echo "  3) 探活："
echo "       curl -s https://xxxx.cfc-execute.bj.baidubce.com/ai/api/health"
echo "  4) Actions 重新跑 Deploy frontend to GitHub Pages"
