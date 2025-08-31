#!/usr/bin/env bash
# Stop dev servers started by Makefile/dev_start
set -euo pipefail

echo "Stopping dev servers (if running)"
if [ -f /tmp/vite.pid ]; then
  pid=$(cat /tmp/vite.pid)
  echo "Killing Vite pid $pid"
  kill "$pid" 2>/dev/null || true
  rm -f /tmp/vite.pid
fi
if [ -f /tmp/backend.pid ]; then
  pid=$(cat /tmp/backend.pid)
  echo "Killing backend pid $pid"
  kill "$pid" 2>/dev/null || true
  rm -f /tmp/backend.pid
fi

echo "Stopped."
