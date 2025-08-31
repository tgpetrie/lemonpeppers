# frontend/README.md

Developer notes — frontend

Start the dev server (detached so it won't suspend):

```bash
cd frontend
nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 < /dev/null &
echo $! > /tmp/vite.pid
```

Check server status:

```bash
sudo lsof -nP -iTCP:5173 -sTCP:LISTEN
curl -I http://127.0.0.1:5173/
```

View logs:

```bash
tail -n 200 /tmp/vite.log
```

Stop dev server:

```bash
if [ -f /tmp/vite.pid ]; then kill $(cat /tmp/vite.pid) 2>/dev/null || true; rm -f /tmp/vite.pid; fi
```

Notes
- Use `setsid` or `tmux` for a long-running session if you prefer not to use nohup/disown.
- Vite proxy is configured in `vite.config.js` to forward `/api` and `/ws` to the backend.
