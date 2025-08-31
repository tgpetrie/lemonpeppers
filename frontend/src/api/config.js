// frontend/src/api/config.js
// Single-clean implementation for API origin and ws/url helpers.

const fromEnv = (k, fallback) =>
  (import.meta?.env && import.meta.env[k] != null && String(import.meta.env[k]).trim() !== '')
    ? import.meta.env[k]
    : fallback;

// RAW_API_URL can be '/api' (use dev proxy) or an absolute origin (http(s)://host[:port])
const RAW_API_URL = fromEnv('VITE_API_URL', '/api');

function normalizeOrigin(raw) {
  if (!raw) return '';
  const u = String(raw).trim();
  if (u.startsWith('/')) {
    return '';
  }
  const maybe = /^https?:\/\//i.test(u) ? u : `http://${u}`;
  try {
    const parsed = new URL(maybe);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

export const API_ORIGIN = normalizeOrigin(RAW_API_URL); // empty = use relative /api (vite proxy)

export function makeWsUrl(path = '/ws') {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_ORIGIN) {
    const protocol = (typeof location !== 'undefined' && location.protocol === 'https:') ? 'wss:' : 'ws:';
    const host = (typeof location !== 'undefined') ? location.host : 'localhost';
    return `${protocol}//${host}${p}`;
  }
  try {
    const httpUrl = new URL(API_ORIGIN);
    const wsProto = (httpUrl.protocol === 'https:') ? 'wss:' : 'ws:';
    return `${wsProto}//${httpUrl.host}${p}`;
  } catch {
    const protocol = (typeof location !== 'undefined' && location.protocol === 'https:') ? 'wss:' : 'ws:';
    const host = (typeof location !== 'undefined') ? location.host : 'localhost';
    return `${protocol}//${host}${p}`;
  }
}

export function apiUrl(p = '') {
  const suffix = String(p || '').replace(/^\/+/, '');
  if (!API_ORIGIN) {
    return `/api/${suffix}`.replace(/\/+$/, '');
  }
  return `${API_ORIGIN}/api/${suffix}`.replace(/\/+$/, '');
}
