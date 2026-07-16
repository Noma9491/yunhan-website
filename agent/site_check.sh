#!/bin/bash

set -e

PROJECT_DIR="/home/shared/Yunhan"

echo "===== Yunhan Site Check ====="
echo "Time: $(date)"
echo ""

cd "$PROJECT_DIR"

echo "===== Git Branch ====="
git branch --show-current
echo ""

echo "===== Git Status ====="
git status --short
echo ""

echo "===== Latest Commit ====="
git log -1 --oneline
echo ""

echo "===== Remote ====="
git remote -v | sed -E 's#https://[^@]+@github.com#https://***@github.com#g'
echo ""

echo "===== CNAME ====="
if [ -f CNAME ]; then
  cat CNAME
else
  echo "CNAME file not found"
fi
echo ""

echo "===== Sensitive Files Tracked Check ====="
git ls-files | grep -E "learning-log.md|\.env|\.pem|\.key|\.log|\.DS_Store" || echo "No sensitive tracked files found"
echo ""

echo "===== Public Site HTTPS ====="
curl -I -L --max-time 15 https://www.yunhan.com.tw || true
echo ""

echo "===== Apex Domain HTTPS ====="
curl -I -L --max-time 15 https://yunhan.com.tw || true
echo ""

echo "===== Local Nginx ====="
curl -I --max-time 10 http://localhost || true
echo ""

echo "===== DNS ====="
dig www.yunhan.com.tw CNAME +noall +answer || true
dig yunhan.com.tw A +noall +answer || true

