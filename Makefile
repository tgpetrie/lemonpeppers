# Makefile - small developer helpers

.PHONY: dev start-frontend start-backend stop logs smoke

start-backend:
	@if [ -f backend/app.py ]; then \
		cd backend && nohup python3 app.py > /tmp/backend.log 2>&1 & echo $$! > /tmp/backend.pid; \
		echo "backend started -> $$(cat /tmp/backend.pid)"; \
	else \
		echo "no backend/app.py found"; \
	fi

start-frontend:
	@if [ -d frontend ]; then \
		cd frontend && nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 < /dev/null & echo $$! > /tmp/vite.pid; \
		echo "frontend started -> $$(cat /tmp/vite.pid)"; \
	else \
		echo "no frontend folder"; \
	fi

dev: start-backend start-frontend
	@echo "dev tasks started"

.PHONY: restart-dev
restart-dev:
	@./scripts/dev_restart.sh

stop:
	@echo "stopping dev servers (if present)"; \
	if [ -f /tmp/vite.pid ]; then kill $$(cat /tmp/vite.pid) 2>/dev/null || true; rm -f /tmp/vite.pid; fi; \
	if [ -f /tmp/backend.pid ]; then kill $$(cat /tmp/backend.pid) 2>/dev/null || true; rm -f /tmp/backend.pid; fi; \
	echo "stopped"

logs:
	@echo "tailing logs (ctrl-c to stop)"; \
	tail -f /tmp/backend.log /tmp/vite.log || true

smoke:
	@BACKEND_PORT=5004 FRONTEND_PORT=5173 ./smoke_test.sh

	# Optional: attempt a Socket.IO WebSocket-level smoke check (requires node/socket.io-client)
	@node ./scripts/smoke_ws.js || echo "Socket.IO smoke check failed (this may be expected if backend not running)"
