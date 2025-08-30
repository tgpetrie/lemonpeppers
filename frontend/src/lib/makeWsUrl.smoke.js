import { makeWsUrl } from './makeWsUrl';

export function smokeCheckWsUrl() {
  const u = makeWsUrl('/ws');
  console.assert(/^wss?:\/\//.test(u), 'makeWsUrl should return ws(s) URL', u);
  if (import.meta.env.DEV) console.log('[smoke] WS URL:', u);
}
