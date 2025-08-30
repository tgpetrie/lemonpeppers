#!/usr/bin/env zsh
set -euo pipefail

# Make comments safe in interactive zsh
setopt interactivecomments || true
set +o histexpand || true

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Load .env (shared config)
[[ -f .env ]] && source .env
BACKEND_PORT=${BACKEND_PORT:-5004}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

"$ROOT_DIR/kill_ports.sh"

# --- start backend ---
echo "▶ Starting backend on :${BACKEND_PORT} ..."
pushd backend >/dev/null

# Activate venv if present
if [[ -d "$ROOT_DIR/.venv" ]]; then
  source "$ROOT_DIR/.venv/bin/activate"
fi

# Choose python
PY="python3"
command -v python >/dev/null 2>&1 && PY="python"

export PORT="${BACKEND_PORT}"
$PY app.py &            # For Flask
BACK_PID=$!

# For FastAPI/Uvicorn users, do this instead:
# uvicorn app:app --host 0.0.0.0 --port "${BACKEND_PORT}" --reload &
# BACK_PID=$!

popd >/dev/null

# --- start frontend ---
echo "▶ Starting frontend (Vite) on :${FRONTEND_PORT} ..."
pushd frontend >/dev/null
if [[ ! -d node_modules ]]; then
  npm install
fi
npm run dev -- --port "${FRONTEND_PORT}" --strictPort &
FRONT_PID=$!
popd >/dev/null

# --- wait & trap ---
echo ""
echo "✅ Dev environment ready:"
echo "   Frontend: http://localhost:${FRONTEND_PORT}"
echo "   Backend : http://localhost:${BACKEND_PORT}"
echo "(Press Ctrl+C to stop)"

cleanup() {
  echo ""
  echo "⏹ Stopping dev processes..."
  kill ${BACK_PID} 2>/dev/null || true
  kill ${FRONT_PID} 2>/dev/null || true
}
trap cleanup EXIT

wait
