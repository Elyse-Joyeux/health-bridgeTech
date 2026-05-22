// Moved from frontend/api/client.ts
const TOKEN_KEY = 'hb_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/bridgetech-service${p}`;
}

export async function api(path, options = {}) {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl(path), { ...rest, headers: finalHeaders });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (err) {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function streamSSE(path, onMessage) {
  const token = getToken();
  const ctrl = new AbortController();

  (async () => {
    try {
      const res = await fetch(apiUrl(path), {
        signal: ctrl.signal,
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (!ctrl.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const chunk = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const line = chunk.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;
          try {
            onMessage(JSON.parse(line.slice(5).trim()));
          } catch (err) {
            // skip invalid SSE payload
          }
        }
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.warn('SSE error', err);
    }
  })();

  return () => ctrl.abort();
}
