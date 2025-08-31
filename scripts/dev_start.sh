#!/usr/bin/env bash
set -euo pipefail

# scripts/dev_start.sh
# Start backend and frontend in detached mode and write PIDs/logs to /tmp.
# Assumptions (reasonable):
# - Backend can be started with `python3 backend/app.py` when `backend/app.py` exists.
# - Frontend is started with `npm run dev` inside the `frontend` folder.
# If your project uses a different command to run the backend (uvicorn/gunicorn), update this file.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[dev_start] repo root: $ROOT"

# cleanup previous artifacts (do not fail if missing)
rm -f /tmp/vite.pid /tmp/backend.pid /tmp/vite.log /tmp/backend.log || true

# Start backend if present
if [ -f "$ROOT/backend/app.py" ]; then
  echo "[dev_start] starting backend (backend/app.py) -> /tmp/backend.log"
  (cd "$ROOT/backend" && nohup python3 app.py > /tmp/backend.log 2>&1 & echo $! > /tmp/backend.pid)
else
  echo "[dev_start] no backend/app.py found; skipping backend start"
fi

# Start frontend if present
if [ -d "$ROOT/frontend" ]; then
  echo "[dev_start] starting frontend (npm run dev) -> /tmp/vite.log"
  # redirect stdin from /dev/null and disown so it cannot be suspended by the terminal
  (cd "$ROOT/frontend" && nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 < /dev/null & echo $! > /tmp/vite.pid)
else
  echo "[dev_start] no frontend folder found; skipping frontend start"
fi

# Give processes a moment to start
sleep 1

# Report status
if [ -f /tmp/backend.pid ]; then
  echo "[dev_start] backend pid -> $(cat /tmp/backend.pid)"
else
  echo "[dev_start] backend not started"
fi

if [ -f /tmp/vite.pid ]; then
  echo "[dev_start] frontend pid -> $(cat /tmp/vite.pid)"
else
  echo "[dev_start] frontend not started"
fi

cat <<'EOF'

Logs are written to:
  /tmp/backend.log
  /tmp/vite.log

Tail logs:
  tail -f /tmp/backend.log /tmp/vite.log

Stop servers (safe):
  if [ -f /tmp/vite.pid ]; then kill $(cat /tmp/vite.pid) 2>/dev/null || true; rm -f /tmp/vite.pid; fi
  if [ -f /tmp/backend.pid ]; then kill $(cat /tmp/backend.pid) 2>/dev/null || true; rm -f /tmp/backend.pid; fi

EOF
