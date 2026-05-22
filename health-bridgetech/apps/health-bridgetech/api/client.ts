/**
 * Always use a relative path in the browser. The Vite dev server proxies
 * `/bridgetech-service/*` to the backend, and in production the platform gateway
 * serves it on the same origin — so CORS never enters the picture.
 */
const TOKEN_KEY = 'hb_token';

/** Read the stored auth token from localStorage */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/** Persist the auth token */
export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

/** Build the API URL — always same-origin via the platform gateway prefix */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/bridgetech-service${p}`;
}

/** Typed fetch helper. Throws on non-2xx responses. */
export async function api<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
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
    } catch {/* ignore */}
    throw new Error(message);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

/** Open a Server-Sent Events stream against an authenticated backend endpoint */
export function streamSSE(path: string, onMessage: (data: any) => void): () => void {
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
          try { onMessage(JSON.parse(line.slice(5).trim())); } catch {/* skip */}
        }
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') console.warn('SSE error', err);
    }
  })();
  return () => ctrl.abort();
}
