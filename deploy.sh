#!/bin/bash

set -e

echo "開始部署蘊涵網站..."

SOURCE_DIR="$HOME/Desktop/Yunhan/"
TARGET_DIR="/var/www/yunhan/"

echo "來源資料夾：$SOURCE_DIR"
echo "部署目錄：$TARGET_DIR"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "錯誤：來源資料夾不存在。"
  exit 1
fi

if [ ! -f "$SOURCE_DIR/index.html" ]; then
  echo "錯誤：來源資料夾內找不到 index.html。"
  exit 1
fi

if [ ! -d "$SOURCE_DIR/assets" ]; then
  echo "錯誤：來源資料夾內找不到 assets 資料夾。"
  exit 1
fi

echo "來源檢查通過。"

echo "預覽即將同步的內容..."
sudo rsync -av --dry-run --delete \
  --exclude 'learning-log.md' \
  --exclude 'deploy.sh' \
  --exclude 'deploy.sh.bak' \
  --exclude '.DS_Store' \
  "$SOURCE_DIR" "$TARGET_DIR"

echo "--------------------------------"
read -p "確認要正式部署嗎？輸入 y 繼續：" CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "已取消部署。"
  exit 0
fi

echo "開始正式同步..."

sudo rsync -av --delete \
  --exclude 'learning-log.md' \
  --exclude 'deploy.sh' \
  --exclude 'deploy.sh.bak' \
  --exclude '.DS_Store' \
  "$SOURCE_DIR" "$TARGET_DIR"

echo "整理網站目錄權限..."

sudo chown -R root:root "$TARGET_DIR"
sudo find "$TARGET_DIR" -type d -exec chmod 755 {} \;
sudo find "$TARGET_DIR" -type f -exec chmod 644 {} \;

echo "權限整理完成。"

echo "部署完成。"

echo "確認部署結果："
ls -la "$TARGET_DIR"

echo "檢查首頁是否存在："
if [ -f "$TARGET_DIR/index.html" ]; then
  echo "index.html 存在，部署成功。"
else
  echo "錯誤：部署後找不到 index.html。"
  exit 1
fi
