/**
 * DEPRECATED BACKUP COMPONENT
 * -------------------------------------------------------------
 * This file is kept only as a reference backup while we migrate
 * to the new Watchlist implementation. Do NOT import this file
 * anywhere in the app. If imported accidentally, it will throw
 * a clear error in development to prevent accidental usage.
 */

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchData, getWatchlist, addToWatchlist, removeFromWatchlist } from '../api.js';
import { useWebSocket } from '../context/websocketcontext.jsx';
import { formatPrice, truncateSymbol, formatPercentage } from '../utils/formatters.js';
import StarIcon from './StarIcon';

const WatchlistBackup = ({ onWatchlistChange, topWatchlist, quickview }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { send } = useWebSocket();

  useEffect(() => {
    async function fetchDataAndWatchlist() {
      setLoading(true);
      const data = await getWatchlist();
      setWatchlist(data);
      setLoading(false);
    }
    fetchDataAndWatchlist();
  }, []);

  const handleToggleWatchlist = async (symbol) => {
    const exists = watchlist.some(it => (typeof it === 'string' ? it === symbol : it.symbol === symbol));
    let updated;
    if (exists) {
      updated = await removeFromWatchlist(symbol);
      send?.('watchlist_update', { action: 'remove', symbol });
    } else {
      updated = await addToWatchlist(symbol);
      send?.('watchlist_update', { action: 'add', symbol });
    }
    setWatchlist(updated);
    if (onWatchlistChange) onWatchlistChange(updated);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-gray-500 font-mono">Loading watchlist...</div>
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted font-mono">No items in watchlist</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {watchlist.map((item) => {
        const symbol = typeof item === 'string' ? item : item.symbol;
        const price = item.current_price ?? item.price ?? 0;
        const change = item.price_change_percentage_24h ?? item.change24h ?? 0;
        const url = `https://www.coinbase.com/advanced-trade/spot/${symbol.toLowerCase()}-USD`;
        return (
          <div key={symbol} className="flex items-center justify-between py-2 border-b border-gray-700">
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <div className="font-bold text-white text-lg tracking-wide">{truncateSymbol(symbol, 6)}</div>
              <div className="text-sm text-gray-400">{formatPrice(price)}</div>
              <div className={`text-sm font-semibold ${change >= 0 ? 'text-teal' : 'text-pink'}`}>
                {change >= 0 ? '+' : ''}{formatPercentage(change)}
              </div>
            </a>
            <button
              onClick={() => handleToggleWatchlist(symbol)}
              aria-label={`Remove ${symbol} from watchlist`}
              className="p-1"
            >
              <StarIcon filled={true} className="text-yellow-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Export the backup under a different name so it cannot conflict
// with the real Watchlist. Intentionally throw if someone tries
// to render it by mistake in development.
export default function Watchlist() {
  if (process && process.env && process.env.NODE_ENV !== 'production') {
    throw new Error('Watchlist.backup.jsx is deprecated. Use the new Watchlist component.');
  }
  return null;
}

// Also export the backup explicitly if needed for manual inspection
export { WatchlistBackup };