#!/bin/bash
# create_components.sh — drop-in script to create final uniform components

set -e

mkdir -p src/components

# 1. UniformCard.jsx
cat > src/components/UniformCard.jsx <<'EOF'
import React from 'react';
import StarIcon from './StarIcon.jsx';

export default function UniformCard({ coin, showPeak = false }) {
  return (
    <div className="bg-dark/40 hover:bg-dark/60 rounded-xl p-4 flex justify-between items-center transition-all">
      <div className="flex items-center gap-3">
        <span className="text-purple font-bold">#{coin.rank}</span>
        <span className="font-headline font-semibold">{coin.symbol}</span>
        <span className="font-raleway font-bold">${coin.price}</span>
        {showPeak && coin.peakLevel > 0 && (
          <span className="ml-2 text-xs text-blue-300">px{coin.peakLevel}</span>
        )}
      </div>
      <div className={`font-raleway font-bold ${coin.change >= 0 ? 'text-purple' : 'text-pink'}`}>
        {coin.change >= 0 ? '+' : ''}{coin.change}%
      </div>
      <StarIcon symbol={coin.symbol} />
    </div>
  );
}
EOF

# 2. Top1MinTable.jsx
cat > src/components/Top1MinTable.jsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchData } from '../api.js';
import UniformCard from './UniformCard.jsx';

export default function Top1MinTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchData(API_ENDPOINTS.gainersTable1Min).then(res => {
      if (res?.data) {
        setRows(res.data.map((item, i) => ({
          rank: i + 1,
          symbol: item.symbol.replace('-USD',''),
          price: item.current_price?.toFixed(2) || '0.00',
          change: item.price_change_percentage_1min?.toFixed(2) || '0.00',
          peakLevel: item.peakLevel || 0
        })));
      }
    }).catch(err => console.error('Top1MinTable error:', err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {rows.map(coin => (
        <UniformCard key={coin.symbol} coin={coin} showPeak={true} />
      ))}
    </div>
  );
}
EOF

# 3. GainersTable.jsx
cat > src/components/GainersTable.jsx <<'EOF'
import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchData } from '../api.js';
import UniformCard from './UniformCard.jsx';

export default function GainersTable() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchData(API_ENDPOINTS.gainersTable3Min).then(res => {
      if (res?.data) {
        setRows(res.data.map((item, i) => ({
          rank: i + 1,
          symbol: item.symbol.replace('-USD',''),
          price: item.current_price?.toFixed(2) || '0.00',
          change: item.price_change_percentage_3min?.toFixed(2) || '0.00',
          peakLevel: item.peakLevel || 0
        })));
      }
    }).catch(err => console.error('GainersTable error:', err));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-purple">3-Minute Gainers</h2>
      {rows.map(coin => (
        <UniformCard key={coin.symbol} coin={coin} showPeak={true} />
      ))}
    </div>
  );
}
EOF

# 4. LosersTable.jsx
cat > src/components/LosersTable.jsx <<'EOF'
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
EOF

echo "✅ Components created in src/components/"