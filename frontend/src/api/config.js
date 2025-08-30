// frontend/src/api/config.js
// Unified API + WebSocket config for both dev (proxy) and prod.

const fromEnv = (k, fallback) =>
  (import.meta?.env && import.meta.env[k] != null && String(import.meta.env[k]).trim() !== '')
    ? import.meta.env[k]
    : fallback;

// RAW_API_URL can be '/api' (use dev proxy) or an absolute origin (http(s)://host[:port])
const RAW_API_URL = fromEnv('VITE_API_URL', '/api');

function normalizeOrigin(raw) {
  if (!raw) return '';
  const u = String(raw).trim();
  // If it starts with '/', use empty origin so dev proxy uses same-origin /api paths
  if (u.startsWith('/')) return '';
  // If it looks like host:port, add http://
  const maybe = !/^https?:\/\//i.test(u) ? `http://${u}` : u;
  try {
    const parsed = new URL(maybe);
    // Strip trailing slash and return origin only (no path)
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

export const API_ORIGIN = normalizeOrigin(RAW_API_URL); // empty string means proxy to /api

// Build a WS URL matching API origin or relative proxy
export function makeWsUrl(path = '/ws') {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_ORIGIN) {
    const protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}${p}`;
  }
  try {
    const httpUrl = new URL(API_ORIGIN);
    const wsProto = (httpUrl.protocol === 'https:') ? 'wss:' : 'ws:';
    return `${wsProto}//${httpUrl.host}${p}`;
  } catch {
    const protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
    return `${protocol}//${location.host}${p}`;
  }
}

// Helper: build API endpoint from origin (empty origin -> relative /api path)
export function apiUrl(p = '') {
  const suffix = String(p || '').replace(/^\/+/, '');
  if (!API_ORIGIN) {
    return `/api/${suffix}`.replace(/\/+$/, '');
  }
  return `${API_ORIGIN}/api/${suffix}`.replace(/\/+$/, '');
}
// Unified API + WebSocket config for both dev (proxy) and prod.

const fromEnv = (k, fallback) =>
  (import.meta?.env && import.meta.env[k] != null && String(import.meta.env[k]).trim() !== '')
    ? import.meta.env[k]
    : fallback;

// If you want to force absolute URLs, set VITE_API_URL in .env or .env.local.
// Otherwise, we’ll use relative '/api' so Vite proxy handles it in dev.
const RAW_API_URL = fromEnv('VITE_API_URL', '/api');

// Normalize: allow users to set plain host:port, with/without protocol, with/without trailing slash.
function normalizeBase(urlLike) {
  if (!urlLike) return '/api';
  let u = String(urlLike).trim();

  // If it looks like host:port, add http://
  if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) {
    u = 'http://' + u;
  }

  // If it’s still relative (starts with '/'), leave as-is for proxy
  if (u.startsWith('/')) {
    return u.replace(/\/+$/, ''); // strip trailing /
  }

  try {
    const parsed = new URL(u);
    // Strip trailing slash
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    // If the user provided a host:port without path, we may want to target /api on that origin.
    // Do not force /api here; callers should pass /api prefixed paths when needed.
    return parsed.origin + parsed.pathname;
  } catch {
    return '/api';
  }
}

export const API_BASE_URL = normalizeBase(RAW_API_URL);

// Build a WS URL matching API base
export function makeWsUrl(path = '/ws') {
  // Relative API base → build relative ws path so proxy works
  if (API_BASE_URL.startsWith('/')) {
    const protocol = (typeof location !== 'undefined' && location.protocol === 'https:') ? 'wss:' : 'ws:';
    const host = (typeof location !== 'undefined') ? location.host : 'localhost';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}//${host}${p}`;
  }

  // Absolute API base → convert http(s) to ws(s), same host
  try {
    const httpUrl = new URL(API_BASE_URL, typeof location !== 'undefined' ? location.href : undefined);
    const wsProto = (httpUrl.protocol === 'https:') ? 'wss:' : 'ws:';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${wsProto}//${httpUrl.host}${p}`;
  } catch {
    // Fallback to current host
    const protocol = (typeof location !== 'undefined' && location.protocol === 'https:') ? 'wss:' : 'ws:';
    const p = path.startsWith('/') ? path : `/${path}`;
    const host = (typeof location !== 'undefined') ? location.host : 'localhost';
    return `${protocol}//${host}${p}`;
  }
}

// Helper: join paths safely (handles relative and absolute API_BASE_URL)
export function apiUrl(p = '') {
  const suffix = String(p || '').replace(/^\/+/, '');
  if (API_BASE_URL.startsWith('/')) {
    return `${API_BASE_URL}/${suffix}`.replace(/\/+$/, '');
  }
  return `${API_BASE_URL}/${suffix}`.replace(/\/+$/, '');
}
