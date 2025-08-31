#!/usr/bin/env bash
# Robust dev restart helper
# Kills any process listening on BACKEND_PORT and FRONTEND_PORT and restarts
# backend and frontend detached, writing pids/logs under /tmp.

set -euo pipefail

# Load repo .env if present (simple KEY=VALUE parsing, ignore comments)
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs) || true
fi

BACKEND_PORT=${BACKEND_PORT:-5004}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo "Restarting dev servers: backend:${BACKEND_PORT} frontend:${FRONTEND_PORT}"

echo "Stopping any process listening on ports ${BACKEND_PORT} or ${FRONTEND_PORT}"

kill_port() {
  local port=$1
  # Find PIDs listening on the port and kill them
  pids=$(lsof -t -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Killing PIDs on port ${port}: $pids"
    for p in $pids; do
      kill -9 "$p" 2>/dev/null || true
    done
    sleep 0.3
  else
    echo "No process on port ${port}"
  fi
}

kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

echo "Starting backend (port ${BACKEND_PORT})"
export BACKEND_PORT
export PORT=${BACKEND_PORT}
if [ -x backend/.venv/bin/python ]; then
  nohup backend/.venv/bin/python backend/app.py > /tmp/backend.log 2>&1 < /dev/null &
else
  nohup python3 backend/app.py > /tmp/backend.log 2>&1 < /dev/null &
fi
echo $! > /tmp/backend.pid
echo "backend started -> $(cat /tmp/backend.pid)"

echo "Starting frontend (port ${FRONTEND_PORT})"
export FRONTEND_PORT
if [ -d frontend ]; then
  # Ensure npm dev uses correct port; Vite accepts --port
  (cd frontend && nohup npm run dev -- --port ${FRONTEND_PORT} --host 0.0.0.0 > /tmp/vite.log 2>&1 < /dev/null & echo $! > /tmp/vite.pid)
  sleep 0.2
  if [ -f /tmp/vite.pid ]; then
    echo "frontend started -> $(cat /tmp/vite.pid)"
  else
    echo "Failed to start frontend (no pid written). Check /tmp/vite.log"
  fi
else
  echo "No frontend directory; skipping frontend start"
fi

echo "Restart complete. Tail logs with: tail -f /tmp/backend.log /tmp/vite.log"
