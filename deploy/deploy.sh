#!/usr/bin/env bash
# Pull, build and (re)start the app. Run on the server:
#   bash /var/www/vaiven/deploy/deploy.sh
set -euo pipefail

APP_DIR=/var/www/vaiven
cd "$APP_DIR"

if [ ! -f .env.production.local ]; then
  echo "Missing .env.production.local (NEXT_PUBLIC_* vars are inlined at build time)" >&2
  exit 1
fi

if [ -d .git ]; then
  git pull --ff-only
fi
npm ci
npm run build
mkdir -p .cache

if pm2 describe vaiven >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save
