import React, { Suspense, lazy } from 'react'

const GainersTable = lazy(() => import('./components/GainersTable.jsx'))
const LosersTable = lazy(() => import('./components/LosersTable.jsx'))
const TopBannerScroll = lazy(() => import('./components/TopBannerScroll.jsx'))
const BottomBannerScroll = lazy(() => import('./components/BottomBannerScroll.jsx'))

export default function App() {
  return (
    <div className="container">
      <img src="/bhabit-logo.png" alt="Bhabit Logo" className="w-32 h-32 mx-auto mb-4" />
      <h1>CBMOONERS</h1>

      <Suspense fallback={<div>Loading top banner…</div>}>
        <TopBannerScroll />
      </Suspense>

      <Suspense fallback={<div>Loading gainers…</div>}>
        <GainersTable />
      </Suspense>

      <Suspense fallback={<div>Loading losers…</div>}>
        <LosersTable />
      </Suspense>

      <Suspense fallback={<div>Loading bottom banner…</div>}>
        <BottomBannerScroll />
      </Suspense>
    </div>
  )
}