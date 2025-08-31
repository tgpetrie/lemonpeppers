import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import wsManager, {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToWebSocket,
  sendWebSocketMessage,
  getWebSocketStatus
} from '../services/websocket.js';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [status, setStatus] = useState(getWebSocketStatus());

  useEffect(() => {
    // keep local status in sync with manager
    const update = () => setStatus(getWebSocketStatus());
    const unsub = subscribeToWebSocket('connection', update);

    // auto-connect on mount
    connectWebSocket();

    return () => {
      try { unsub(); } catch (e) { /* ignore */ }
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = useCallback((event, cb) => subscribeToWebSocket(event, cb), []);
  const send = useCallback((event, payload) => sendWebSocketMessage(event, payload), []);

  const value = useMemo(() => ({ status, subscribe, send, manager: wsManager }), [status, subscribe, send]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return ctx;
};