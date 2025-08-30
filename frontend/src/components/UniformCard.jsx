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
