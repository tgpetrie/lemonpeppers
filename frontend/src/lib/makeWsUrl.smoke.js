import { makeWsUrl } from './makeWsUrl';

export function smokeCheckWsUrl() {
	try {
		const ws = makeWsUrl('/ws');
		// eslint-disable-next-line no-console
		console.info('[smoke] websocket url ->', ws);
		return ws;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('[smoke] makeWsUrl failed', e && e.message ? e.message : e);
		return null;
	}
}
