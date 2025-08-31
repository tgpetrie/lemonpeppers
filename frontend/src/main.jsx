import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import { WebSocketProvider } from './context/websocketcontext.jsx';
import '../public/styles.css';
import { smokeCheckWsUrl } from './lib/makeWsUrl.smoke';

// Responsive best practices: index.css already includes Tailwind and responsive settings.
// No changes needed here, but ensure root element is used for hydration.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </React.StrictMode>
);

// Run a small smoke check for the WS URL in the browser only. Don't let it break app startup.
if (typeof window !== 'undefined') {
  try {
    smokeCheckWsUrl();
  } catch (e) {
    // swallow in dev, console for visibility
    // eslint-disable-next-line no-console
    console.warn('smokeCheckWsUrl failed:', e && e.message ? e.message : e);
  }
}
