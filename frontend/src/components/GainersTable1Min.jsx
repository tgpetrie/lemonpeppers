import React from 'react';
import StarIcon from './StarIcon.jsx';

/**
 * Uniform card/table shell for 1‑min Gainers.
 * Pure presentational: no fetching, no routing. Feed it data via props.
 *
 * Props:
 *  - title: string (e.g., "1‑MIN GAINERS")
 *  - rows: Array<{
 *      rank?: number,
 *      symbol: string,
 *      price: number,
 *      pct: number, // +/- percentage change
 *      peaks?: number[], // optional spark/peak markers
 *      inWatchlist?: boolean
 *    }>
 *  - fixedRows: number (default 4) — keeps side-by-side cards aligned
 *  - onToggleWatchlist?: (symbol: string) => void
 */
export default function GainersTable1Min({
  title = '1‑MIN GAINERS',
  rows = [],
  fixedRows = 4,
  onToggleWatchlist,
}) {
  const filledRows = React.useMemo(() => {
    const slice = rows.slice(0, fixedRows);
    while (slice.length < fixedRows) slice.push(null);
    return slice;
  }, [rows, fixedRows]);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-xs tracking-[0.18em] text-white/80">{title}</h3>
      </div>

      {/* Body */}
      <div className="divide-y divide-white/5">
        {filledRows.map((row, idx) => (
          <Row
            key={(row?.symbol || 'placeholder') + '-' + idx}
            data={row}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ data, onToggleWatchlist }) {
  const isPlaceholder = !data;
  const symbol = data?.symbol ?? '';
  const price = data?.price ?? 0;
  const pct = data?.pct ?? 0;
  const rank = data?.rank ?? '';
  const inWatchlist = !!data?.inWatchlist;

  const pctClass = pct > 0
    ? 'text-[#C026D3]' // purple (positive)
    : pct < 0
      ? 'text-pink' // pink (negative)
      : 'text-white/60';

  const prevPrice = !isPlaceholder && price
    ? price / (1 + (pct || 0) / 100)
    : 0;

  return (
    <div
      className={[
        'grid items-center h-[96px] px-4 transition-colors',
        'grid-cols-[minmax(0,1fr)_152px_108px_28px]', // name | price | % | star
        isPlaceholder ? 'opacity-30' : 'hover:bg-white/5',
      ].join(' ')}
    >
      {/* Col 1: Rank • Symbol • optional peaks/streak */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-6 shrink-0 text-[11px] text-white/40 text-center font-raleway tabular-nums">{rank}</div>
        <div className="min-w-0">
          <div className="text-sm text-white truncate">{symbol || '\u00A0'}</div>
          <div className="mt-1 flex items-center gap-1">
            {Array.isArray(data?.peaks)
              ? data.peaks.slice(0, 6).map((v, i) => (
                  <span
                    key={symbol + '-pk-' + i}
                    className={
                      'h-1.5 w-1.5 rounded-full ' +
                      (v > 0 ? 'bg-emerald-400/80' : 'bg-white/15')
                    }
                    title={String(v)}
                  />
                ))
              : <span className="h-1.5 w-16 rounded bg-white/5" />}
          </div>
        </div>
      </div>

      {/* Col 2: Price (with tiny previous price hint) */}
      <div className="text-right font-raleway tabular-nums">
        <div className="text-sm text-white">{!isPlaceholder ? price.toFixed(2) : '\u00A0'}</div>
        <div className="text-[11px] text-white/40">{!isPlaceholder ? `prev ${prevPrice.toFixed(2)}` : '\u00A0'}</div>
      </div>

      {/* Col 3: % change */}
      <div className={['text-right text-sm font-medium font-raleway tabular-nums', pctClass].join(' ')}>
        {!isPlaceholder ? (pct > 0 ? '+' : '') + pct.toFixed(2) + '%' : '\u00A0'}
      </div>

      {/* Col 4: Star */}
      <div className="flex items-center justify-end">
        {!isPlaceholder ? (
          <StarIcon
            filled={inWatchlist}
            onClick={() => onToggleWatchlist && onToggleWatchlist(symbol)}
            className={inWatchlist ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
          />
        ) : (
          <span className="inline-block h-4 w-4 rounded-full bg-white/5" />
        )}
      </div>
    </div>
  );
}