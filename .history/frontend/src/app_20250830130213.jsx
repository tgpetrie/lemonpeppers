import React, { Suspense, lazy } from 'react'

const Top1MinTable = lazy(() => import('./components/Top1MinTable.jsx'))
const GainersTable = lazy(() => import('./components/GainersTable.jsx'))
const LosersTable = lazy(() => import('./components/LosersTable.jsx'))
const TopBannerScroll = lazy(() => import('./components/TopBannerScroll.jsx'))
const BottomBannerScroll = lazy(() => import('./components/BottomBannerScroll.jsx'))

export default function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <img src="/bhabit-logo.png" alt="Bhabit Logo" className="w-32 h-32 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-white text-center mb-8">CBMOONERS</h1>

      <Suspense fallback={<div>Loading top banner…</div>}>
        <TopBannerScroll />
      </Suspense>

      {/* 1-Minute Top Movers */}
      <div className="mb-12">
        <Suspense fallback={<div>Loading 1-minute data…</div>}>
          <Top1MinTable />
        </Suspense>
      </div>

      {/* 3-Minute Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<div>Loading 3-min gainers…</div>}>
          <GainersTable />
        </Suspense>

        <Suspense fallback={<div>Loading 3-min losers…</div>}>
          <LosersTable />
        </Suspense>
      </div>

      <Suspense fallback={<div>Loading bottom banner…</div>}>
        <BottomBannerScroll />
      </Suspense>
    </div>
  )
}