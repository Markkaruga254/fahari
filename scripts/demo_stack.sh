#!/usr/bin/env bash
# Persistent local demo stack for People's Priorities.
#
# Starts (or restarts) everything the demo needs, idempotently:
#   1. Postgres (docker, named volume fahari-demo-pgdata survives restarts)
#   2. Backend API reseeded with deterministic synthetic data
#   3. Frontend dev server wired to that backend
#
# Ports 5441/8001 are used deliberately: 5432 and 8000 belong to the
# separate fahari-ledger stack — this script never touches it.
# Secrets come from the repo-root .env (git-ignored); nothing is hardcoded.
#
# Usage: ./scripts/demo_stack.sh        (from anywhere)
# Open:  http://localhost:3000          (landing)
#        http://localhost:3000/dashboard (live board)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_CONTAINER="fahari-demo-db"
DB_VOLUME="fahari-demo-pgdata"
DB_PORT="5441"
API_PORT="8001"
PID_DIR="/tmp/opencode"

# Load repo-root .env for secrets (WEBHOOK_SECRET, PHONE_HASH_PEPPER, ...).
set -a
# shellcheck disable=SC1091
. "$ROOT/.env"
set +a
export DATABASE_URL="postgresql+psycopg://pp:pp@127.0.0.1:${DB_PORT}/pp"
export APP_ENV="${APP_ENV:-dev}" DEMO_MODE=true AUTO_CREATE_DB=true
export AI_ENABLED=false STT_PROVIDER=fake

stop_pid() { # name
  if [ -f "$PID_DIR/$1.pid" ]; then
    kill "$(cat "$PID_DIR/$1.pid")" 2>/dev/null || true
    rm -f "$PID_DIR/$1.pid"
  fi
}

echo "== database =="
if ! docker exec "$DB_CONTAINER" pg_isready -U pp -d pp >/dev/null 2>&1; then
  docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$DB_CONTAINER" \
    -e POSTGRES_USER=pp -e POSTGRES_PASSWORD=pp -e POSTGRES_DB=pp \
    -p "127.0.0.1:${DB_PORT}:5432" \
    -v "$DB_VOLUME:/var/lib/postgresql/data" \
    postgres:16 >/dev/null
fi
for _ in $(seq 1 30); do
  docker exec "$DB_CONTAINER" pg_isready -U pp -d pp >/dev/null 2>&1 && break
  sleep 2
done
docker exec "$DB_CONTAINER" pg_isready -U pp -d pp

echo "== backend seed + api =="
cd "$ROOT/backend"
python3 -m app.services.demo_seed --reset
stop_pid demo-api
nohup python3 -m uvicorn app.main:app --host 127.0.0.1 --port "$API_PORT" \
  > /tmp/opencode/demo-api.log 2>&1 &
echo $! > "$PID_DIR/demo-api.pid"
for _ in $(seq 1 30); do
  curl -s -m 3 "http://127.0.0.1:${API_PORT}/ready" >/dev/null 2>&1 && break
  sleep 2
done
curl -s -m 5 "http://127.0.0.1:${API_PORT}/ready"; echo

echo "== frontend =="
cd "$ROOT/frontend"
export BACKEND_URL="http://127.0.0.1:${API_PORT}" DASHBOARD_API_KEY="$DASHBOARD_API_KEY"
stop_pid demo-dev
setsid nohup npm run dev > /tmp/opencode/demo-dev.log 2>&1 < /dev/null & disown
echo $! > "$PID_DIR/demo-dev.pid"
sleep 12
curl -s -o /dev/null -w "landing:%{http_code} " --max-time 25 http://localhost:3000/
curl -s -o /dev/null -w "dashboard:%{http_code}\n" --max-time 25 http://localhost:3000/dashboard

echo "Demo stack up: landing http://localhost:3000  dashboard http://localhost:3000/dashboard"
