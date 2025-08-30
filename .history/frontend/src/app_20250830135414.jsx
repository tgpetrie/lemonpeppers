// src/app.jsx (or src/App.jsx)
import React, { Suspense } from 'react';
import { WebSocketProvider } from './context/websocketcontext.jsx';

import TopBannerScroll from './components/TopBannerScroll.jsx';
import BottomBannerScroll from './components/BottomBannerScroll.jsx';

import Top1MinTable from './components/Top1MinTable.jsx';
import GainersTable from './components/GainersTable.jsx';
import LosersTable from './components/LosersTable.jsx';

// --- Tiny Error Boundary (local to this file) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(err, info) {
    console.error('ErrorBoundary caught:', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200">
          <div className="font-bold mb-1">Something went wrong rendering the UI.</div>
          <div className="opacity-80 text-sm truncate">{String(this.state.error || '')}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

          {/* Top banner */}
          <Suspense fallback={<div className="h-20 rounded-2xl bg-dark/40 animate-pulse" />}>
            <TopBannerScroll />
          </Suspense>

          <ErrorBoundary>
            <Suspense fallback={<div className="rounded-2xl bg-dark/40 h-48 animate-pulse" />}>
              {/* TOP ROW: 1-minute gainers (your component renders a two-column grid) */}
              <section aria-label="Top 1-minute movers" className="space-y-4">
                <h2 className="text-xl font-bold tracking-wide text-purple">1-Minute Gainers</h2>
                <Top1MinTable />
              </section>

              {/* BOTTOM ROW: 3-minute gainers (left) + losers (right) */}
              <section
                aria-label="3-minute gainers and losers"
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <GainersTable />
                </div>
                <div className="space-y-4">
                  <LosersTable />
                </div>
              </section>
            </Suspense>
          </ErrorBoundary>

          {/* Bottom banner */}
          <Suspense fallback={<div className="h-20 rounded-2xl bg-dark/40 animate-pulse" />}>
            <BottomBannerScroll />
          </Suspense>
        </div>
      </div>
    </WebSocketProvider>
  );
}

export default App;