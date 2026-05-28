#!/bin/bash
set -e

DOMAIN=${1:?"Usage: bash setup-vps.sh <domain> <email>"}
EMAIL=${2:?"Usage: bash setup-vps.sh <domain> <email>"}
APP_DIR="/opt/mailflow"

echo "==> Installing system dependencies"
apt-get update -qq
apt-get install -y curl git ufw certbot

echo "==> Installing Docker"
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

echo "==> Installing Docker Compose v2"
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Cloning repository"
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull
else
  # Replace with your actual GitHub repo URL
  git clone https://github.com/YOUR_USERNAME/mailflow.git "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Generating secrets"
cp backend/.env.example backend/.env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" backend/.env
sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(openssl rand -hex 32)|" backend/.env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 16)|" backend/.env
sed -i "s|REDIS_URL=.*|REDIS_URL=redis://redis:6379|" backend/.env
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://mailflow:$(grep POSTGRES_PASSWORD backend/.env | cut -d= -f2)@postgres:5432/mailflow|" backend/.env

cp frontend/.env.example frontend/.env
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=https://$DOMAIN/api|" frontend/.env

echo "==> Updating nginx config with domain"
sed -i "s|YOUR_DOMAIN|$DOMAIN|g" nginx/nginx.ssl.conf

echo "==> Obtaining SSL certificate"
certbot certonly --standalone -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

echo "==> Building and starting services"
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "==> Running database migrations"
sleep 10
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "==> Adding SSL renewal cron"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker-compose -C $APP_DIR -f docker-compose.prod.yml restart nginx") | crontab -

echo ""
echo "=============================="
echo "MailFlow deployed at: https://$DOMAIN"
echo "==============================""
echo ""
echo "IMPORTANT: Edit backend/.env to add your:"
echo "  - OPENAI_API_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"
echo "Then restart: docker-compose -f docker-compose.prod.yml up -d backend"
