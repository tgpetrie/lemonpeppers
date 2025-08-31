#!/usr/bin/env bash
# Simple backend/frontend smoke test for lemonpeppers
# Usage:
#   API_BASE=http://localhost:5004 FRONTEND_URL=http://localhost:5173 ./smoke_test.sh
# Env fallbacks:
#   API_BASE <- $API_BASE or $VITE_API_URL or http://localhost:${BACKEND_PORT:-5004}
#   FRONTEND_URL <- $FRONTEND_URL or http://localhost:${FRONTEND_PORT:-5173}

set -euo pipefail

API_BASE="${API_BASE:-${VITE_API_URL:-http://localhost:${BACKEND_PORT:-5004}}}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:${FRONTEND_PORT:-5173}}"

echo "🔎 Using:"
echo "  API_BASE     = $API_BASE"
echo "  FRONTEND_URL = $FRONTEND_URL"
echo ""

have_curl() { command -v curl >/dev/null 2>&1; }
if ! have_curl; then
  echo "❌ curl is required for this smoke test."
  exit 1
fi

check_200 () {
  local path="$1"
  local url="${API_BASE}${path}"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" == "200" ]]; then
    echo "✅ ${path} -> 200"
  else
    echo "❌ ${path} -> ${code}  (${url})"
    exit 1
  fi
}

echo "🩺 Backend endpoints:"
check_200 "/api/health" || exit 1
# Banners (ok if they 200 with empty arrays)
check_200 "/api/component/top-banner-scroll" || exit 1
check_200 "/api/component/bottom-banner-scroll" || exit 1

echo ""
echo "🌐 Frontend reachability:"
if curl -sS -o /dev/null "$FRONTEND_URL"; then
  echo "✅ Frontend reachable at $FRONTEND_URL"
else
  echo "⚠️ Frontend NOT reachable at $FRONTEND_URL"
fi

echo ""
echo "ℹ️  WebSocket note:"
echo "    If you use Socket.IO or WS, confirm the path you configured (e.g., /socket.io or /ws)."
echo "    This script only checks HTTP endpoints."

echo ""
echo "🎉 Smoke test completed."