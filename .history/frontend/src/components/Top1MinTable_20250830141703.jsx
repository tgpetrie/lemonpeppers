/**
 * DEPRECATED BACKUP COMPONENT
 * -------------------------------------------------------------
 * This file is kept only as a reference backup while we migrate
 * to the new Watchlist implementation. Do NOT import this file
 * anywhere in the app. If imported accidentally, it will throw
 * a clear error in development to prevent accidental usage.
 */
import React, { useEffect, useState } from 'react';
import { fetchData, API_ENDPOINTS, getWatchlist, addToWatchlist, removeFromWatchlist } from '../api.js';
import { useWebSocket } from '../context/websocketcontext.jsx';

const WatchlistBackup = ({ onWatchlistChange, topWatchlist, quickview }) => {
  const { send } = useWebSocket();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWatchlist = async () => {
      try {
        const data = await getWatchlist();
        if (isMounted) {
          setWatchlist(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    };
    fetchWatchlist();
    return () => { isMounted = false; };
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
    onWatchlistChange?.(updated);
  };

  if (loading) {
    return <div>Loading watchlist...</div>;
  }

  if (watchlist.length === 0) {
    return <div>No items in watchlist.</div>;
  }

  return (
    <div>
      <h2>Watchlist Backup</h2>
      <ul>
        {watchlist.map((item, idx) => {
          const symbol = typeof item === 'string' ? item : item.symbol;
          return (
            <li key={symbol + idx}>
              {symbol}
              <button onClick={() => handleToggleWatchlist(symbol)}>Remove</button>
            </li>
          );
        })}
      </ul>
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
