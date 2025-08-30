import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchData } from '../api.js';
import UniformCard from './UniformCard.jsx';

export default function LosersTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchData(API_ENDPOINTS.losersTable3Min).then(res => {
      if (res?.data) {
        setRows(res.data.map((item, i) => ({
          rank: i + 1,
          symbol: item.symbol.replace('-USD',''),
          price: item.current_price?.toFixed(2) || '0.00',
          change: item.price_change_percentage_3min?.toFixed(2) || '0.00',
          peakLevel: item.peakLevel || 0
        })));
      }
    }).catch(err => console.error('LosersTable error:', err));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-pink">3-Minute Losers</h2>
      {rows.map(coin => (
        <UniformCard key={coin.symbol} coin={coin} showPeak={true} />
      ))}
    </div>
  );
}
