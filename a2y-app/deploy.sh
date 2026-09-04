#!/usr/bin/env bash
# Deploy do A2Y CRM para a VPS (mesmo servidor do Fechapro).
# Uso: ./deploy.sh
set -euo pipefail

VPS_HOST="root@191.252.208.234"
REMOTE_DIR="/app/a2y"
LOCAL_ARCHIVE="/tmp/a2y-deploy.tar.gz"

echo "==> Empacotando projeto..."
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='uploads' \
    --exclude='.git' \
    -czf "$LOCAL_ARCHIVE" .

echo "==> Enviando para a VPS..."
scp "$LOCAL_ARCHIVE" "$VPS_HOST:$REMOTE_DIR/deploy.tar.gz"

echo "==> Extraindo, buildando e subindo containers..."
ssh "$VPS_HOST" "cd $REMOTE_DIR && \
  tar xzf deploy.tar.gz && \
  rm deploy.tar.gz && \
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build"

echo "==> Recarregando Caddy..."
ssh "$VPS_HOST" "docker exec fechapro-caddy caddy reload --config /etc/caddy/Caddyfile"

echo "==> Verificando status..."
ssh "$VPS_HOST" "docker ps --filter name=a2y --format 'table {{.Names}}\t{{.Status}}'"

rm -f "$LOCAL_ARCHIVE"

echo ""
echo "Deploy concluído. https://crmatende.a2ytecnologia.com.br"
