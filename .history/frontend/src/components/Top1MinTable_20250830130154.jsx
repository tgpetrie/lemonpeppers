import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchData, getWatchlist, addToWatchlist, removeFromWatchlist } from '../api.js';
import { useWebSocket } from '../context/websocketcontext.jsx';
import GainersTable1Min from './GainersTable1Min.jsx';

const Top1MinTable = () => {
  const { send } = useWebSocket();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetch1MinData = async () => {
      try {
        const response = await fetchData(API_ENDPOINTS.gainersTable1Min);
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          const next = response.data.slice(0, 8).map((item, index) => ({
            rank: item.rank || (index + 1),
            symbol: item.symbol?.replace('-USD', '') || 'N/A',
            price: item.current_price ?? item.price ?? 0,
            pct: item.price_change_percentage_1min ?? item.change ?? 0,
            peaks: item.peaks || [],
            inWatchlist: false // will be updated below
          }));

          // Update watchlist status
          const watchlistData = await getWatchlist();
          next.forEach(item => {
            item.inWatchlist = watchlistData.some(w => (typeof w === 'string' ? w === item.symbol : w.symbol === item.symbol));
          });

          if (isMounted) {
            setData(next);
            setWatchlist(watchlistData);
          }
        } else if (isMounted) {
          setData([]);
        }
        if (isMounted) setLoading(false);
      } catch (err) {
        console.error('Error fetching 1-min data:', err);
        if (isMounted) {
          setLoading(false);
          setData([]);
        }
      }
    };
    fetch1MinData();
    const interval = setInterval(fetch1MinData, 30000);
    return () => { isMounted = false; clearInterval(interval); };
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

    // Update the data array with new watchlist status
    setData(prevData =>
      prevData.map(item =>
        item.symbol === symbol
          ? { ...item, inWatchlist: !exists }
          : item
      )
    );
  };

  if (loading && data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-[#C026D3] font-mono">Loading 1-min data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted font-mono">No 1-min data available</div>
      </div>
    );
  }

  // Split data into two groups of 4 for side-by-side layout
  const leftData = data.slice(0, 4);
  const rightData = data.slice(4, 8);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-white text-center mb-6">TOP 1-MINUTE MOVERS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GainersTable1Min
          title="TOP GAINERS"
          rows={leftData}
          fixedRows={4}
          onToggleWatchlist={handleToggleWatchlist}
        />
        <GainersTable1Min
          title="TOP MOVERS"
          rows={rightData}
          fixedRows={4}
          onToggleWatchlist={handleToggleWatchlist}
        />
      </div>
    </div>
  );
};

export default Top1MinTable;
