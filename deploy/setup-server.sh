#!/usr/bin/env bash
# One-time server setup (Ubuntu/Debian). Run as a sudo-capable user:
#   bash setup-server.sh
set -euo pipefail

APP_DIR=/var/www/vaiven
REPO=git@github.com:alexandergonzalezsaavedra/ar-rentals-guesty.git

# Node.js 24 LTS + build tools + nginx + certbot
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# PM2 + log rotation
sudo npm install -g pm2
pm2 install pm2-logrotate

# App directory owned by the deploy user
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
fi

# Nginx site
sudo cp "$APP_DIR/deploy/nginx-vaivencol.conf" /etc/nginx/sites-available/vaivencol.com
sudo ln -sf /etc/nginx/sites-available/vaivencol.com /etc/nginx/sites-enabled/vaivencol.com
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Firewall (if ufw is in use)
if command -v ufw >/dev/null; then
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
fi

# Start PM2 on boot
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME"

echo
echo "Next steps:"
echo "  1. Create $APP_DIR/.env.production.local (see .env.example)"
echo "  2. bash $APP_DIR/deploy/deploy.sh"
echo "  3. When DNS resolves: sudo certbot --nginx -d vaivencol.com -d www.vaivencol.com"
