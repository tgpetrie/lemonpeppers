// makeWsUrl.js
export function makeWsUrl(path = '/ws') {
  // If a full ws(s) URL is passed, return it unchanged
  if (/^wss?:\/\//i.test(path)) return path;

  // Prefer explicit VITE_WS_URL if set (e.g. "ws://localhost:5004/ws")
  const fromEnv = import.meta.env.VITE_WS_URL;
  if (fromEnv && String(fromEnv).trim() !== '') return String(fromEnv).replace(/\/+$/, '') + path;

  // Otherwise build from current page origin (works when using Vite proxy)
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${loc.host}${path}`;
}
