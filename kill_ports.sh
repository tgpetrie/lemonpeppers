#!/usr/bin/env zsh
set -e

# Load .env if present
[[ -f .env ]] && source .env
BACK_PORT=${BACKEND_PORT:-5004}
FRONT_PORT=${FRONTEND_PORT:-5173}

kill_port() {
  local PORT=$1
  local PIDS
  PIDS=$(lsof -ti tcp:${PORT} || true)
  if [[ -n "$PIDS" ]]; then
    echo "⛔ Killing processes on :${PORT} -> $PIDS"
    kill -9 $PIDS 2>/dev/null || true
  else
    echo "✅ No process on :${PORT}"
  fi
}

kill_port "$BACK_PORT"
kill_port "$FRONT_PORT"
echo "✨ Ports ${BACK_PORT} and ${FRONT_PORT} are free."
