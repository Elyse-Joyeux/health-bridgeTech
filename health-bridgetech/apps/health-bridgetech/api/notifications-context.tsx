import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './client.js';
import { useAuth } from './auth-context.js';
import type { Notification } from './types.js';

type NotificationsState = {
  items: Notification[];
  unread: number;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

/** Provides notifications & periodic refresh */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      const data = await api<Notification[]>('/api/notifications');
      setItems(data);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await api('/api/notifications/read-all', { method: 'POST' });
    setItems((arr) => arr.map((n) => ({ ...n, read: true })));
  }, [user]);

  const unread = items.filter((n) => !n.read).length;
  const value = useMemo(() => ({ items, unread, refresh, markAllRead }), [items, unread, refresh, markAllRead]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/** Hook for accessing notifications */
export function useNotifications(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
