

import { API_ORIGIN, apiUrl } from './api/config';

// Build a canonical API base that is either an absolute origin + /api or a relative /api path
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api`.replace(/\/+$/, '') : '/api';

const buildEndpoints = () => ({
  topBanner: `${API_BASE}/component/top-banner-scroll`,
  bottomBanner: `${API_BASE}/component/bottom-banner-scroll`,
  gainersTable: `${API_BASE}/component/gainers-table`,
  gainersTable1Min: `${API_BASE}/component/gainers-table-1min`,
  losersTable: `${API_BASE}/component/losers-table`,
  alertsRecent: `${API_BASE}/alerts/recent`,
  topMoversBar: `${API_BASE}/component/top-movers-bar`,
  crypto: `${API_BASE}/crypto`,
  health: `${API_BASE}/health`,
  serverInfo: `${API_BASE}/server-info`,
  marketOverview: `${API_BASE}/market-overview`,
  watchlistInsights: `${API_BASE}/watchlist/insights`,
  watchlistInsightsLog: `${API_BASE}/watchlist/insights/log`,
  watchlistInsightsPrice: `${API_BASE}/watchlist/insights/price`,
  technicalAnalysis: (symbol) => `${API_BASE}/technical-analysis/${symbol}`,
  cryptoNews: (symbol) => `${API_BASE}/news/${symbol}`,
  socialSentiment: (symbol) => `${API_BASE}/social-sentiment/${symbol}`
});

export let API_ENDPOINTS = buildEndpoints();
export const getApiBaseUrl = () => API_BASE_URL;
export const setApiBaseUrl = (url) => {
  if (!url) return;
  API_BASE_URL = url.replace(/\/$/, '');
  API_ENDPOINTS = buildEndpoints();
  try { console.info('[api] Switched API base to', API_BASE_URL); } catch (_) {}
};

export async function fetchLatestAlerts(symbols = []) {
  if (!Array.isArray(symbols) || symbols.length === 0) return {};
  try {
  const res = await fetch(`${API_BASE}/watchlist/insights/latest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols })
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.latest || {};
  } catch (e) {
    console.error('fetchLatestAlerts error', e);
    return {};
  }
}

// Request throttling to prevent resource exhaustion
const requestCache = new Map();
const CACHE_DURATION = 10000; // 10 seconds

// Internal: probe a candidate base URL via /api/health with a short timeout
const probeBase = async (baseUrl, timeoutMs = 1500) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
  // Prefer server-info which should return 200 regardless of external API status
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/server-info`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const CANDIDATE_BASES = [
  'http://localhost:5001', 'http://127.0.0.1:5001',
  'http://localhost:5002', 'http://127.0.0.1:5002',
  'http://localhost:5003', 'http://127.0.0.1:5003',
  'http://localhost:5004', 'http://127.0.0.1:5004',
  'http://localhost:5005', 'http://127.0.0.1:5005',
  'http://localhost:5006', 'http://127.0.0.1:5006',
  'http://localhost:5007', 'http://127.0.0.1:5007'
];

// Fetch data from API with throttling and automatic base fallback
export const fetchData = async (endpoint, fetchOptions = {}) => {
  try {
    // Check cache first to avoid duplicate requests
    const now = Date.now();
    const cached = requestCache.get(endpoint);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }
    const response = await fetch(endpoint, fetchOptions);
    if (response.ok) {
      const data = await response.json();
      requestCache.set(endpoint, { data, timestamp: now });
      return data;
    }
    // Non-OK response: attempt fallback only for likely wrong-host cases (404/502/503)
    const status = response.status;
    if ([404, 502, 503, 504].includes(status)) {
      throw new Error(`HTTP error! status: ${status}`);
    }
    throw new Error(`HTTP error! status: ${status}`);
  } catch (error) {
    // Attempt dynamic base fallback on network errors or wrong-host statuses
    try {
      const oldBase = API_BASE_URL;
      const altBases = CANDIDATE_BASES.filter(b => b.replace(/\/$/, '') !== oldBase.replace(/\/$/, ''));
      for (const base of altBases) {
        const ok = await probeBase(base);
        if (!ok) continue;
        // Rebuild the endpoint using the probed base (don't switch global base until confirmed OK)
        let path = endpoint;
        if (endpoint.startsWith(oldBase)) {
          path = endpoint.substring(oldBase.length);
        } else {
          try {
            const u = new URL(endpoint);
            path = u.pathname + (u.search || '');
          } catch (_) {}
        }
        const newEndpoint = `${base.replace(/\/$/, '')}${path}`;
        const retryRes = await fetch(newEndpoint, fetchOptions);
        if (retryRes.ok) {
          // Commit base change only after endpoint success
          setApiBaseUrl(base);
          const data = await retryRes.json();
          requestCache.set(newEndpoint, { data, timestamp: Date.now() });
          return data;
        }
      }
    } catch (fallbackErr) {
      // swallow to rethrow original error below
    }
    console.error('API fetch error:', error);
    throw error;
  }
};


// --- Local Storage Watchlist Functions ---
const WATCHLIST_KEY = 'crypto_watchlist';

export async function getWatchlist() {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage getWatchlist error:', e);
    return [];
  }
}

export async function addToWatchlist(symbol, price = null) {
  try {
    let list = await getWatchlist();
    // Check if symbol already exists (handle both string and object formats)
    const existingItem = list.find(item => 
      typeof item === 'string' ? item === symbol : item.symbol === symbol
    );
    
    if (!existingItem) {
      // Add as object with price info
      const newItem = { 
        symbol, 
        priceAtAdd: price || Math.random() * 1000 // fallback random price if not provided
      };
      list.push(newItem);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    }
    return list;
  } catch (e) {
    console.error('LocalStorage addToWatchlist error:', e);
    return await getWatchlist();
  }
}

export async function removeFromWatchlist(symbol) {
  try {
    let list = await getWatchlist();
    // Filter by symbol (handle both string and object formats)
    list = list.filter(item => 
      typeof item === 'string' ? item !== symbol : item.symbol !== symbol
    );
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('LocalStorage removeFromWatchlist error:', e);
    return await getWatchlist();
  }
}
