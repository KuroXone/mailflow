#!/bin/bash
set -e

APP_DIR="/opt/mailflow"
cd "$APP_DIR"

echo "==> Pulling latest code"
git pull

echo "==> Building services"
docker-compose -f docker-compose.prod.yml build backend frontend

echo "==> Restarting services with zero downtime"
docker-compose -f docker-compose.prod.yml up -d --no-deps backend frontend

echo "==> Running migrations"
sleep 5
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "==> Deploy complete"
docker-compose -f docker-compose.prod.yml ps
