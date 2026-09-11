#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@191.252.208.234"
REMOTE_DIR="/app/a2y-site"
LOCAL_ARCHIVE="/tmp/a2y-site-deploy.tar.gz"

echo "==> Empacotando site..."
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czf "$LOCAL_ARCHIVE" .

echo "==> Enviando para a VPS..."
ssh "$VPS_HOST" "mkdir -p $REMOTE_DIR"
scp "$LOCAL_ARCHIVE" "$VPS_HOST:$REMOTE_DIR/deploy.tar.gz"

echo "==> Buildando e subindo container..."
ssh "$VPS_HOST" "cd $REMOTE_DIR && tar xzf deploy.tar.gz && rm deploy.tar.gz && docker compose -f docker-compose.prod.yml up -d --build"

echo "==> Recarregando proxy..."
ssh "$VPS_HOST" "docker exec fechapro-caddy caddy reload --config /etc/caddy/Caddyfile"

echo "==> Status..."
ssh "$VPS_HOST" "docker ps --filter name=a2y-site --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

rm -f "$LOCAL_ARCHIVE"
echo "Deploy do site A2Y concluído."
