export function getToken(): string | null;
export function setToken(token: string | null): void;
export function apiUrl(path: string): string;
export function api<T = unknown>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T>;
export function streamSSE(path: string, onMessage: (data: any) => void): () => void;
