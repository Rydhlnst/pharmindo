'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { platformFetch } from '@/lib/api/platform';

type SyncVersionsResponse = {
  versions: Record<string, number>;
  updatedAt: Record<string, string | null>;
};

type UseSyncVersionsOptions = {
  enabled?: boolean;
  visibleIntervalMs?: number;
  hiddenIntervalMs?: number;
  onVersionsChanged: (changedKeys: string[], versions: Record<string, number>) => void | Promise<void>;
};

function getWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/sync`;
}

export function useSyncVersions(
  keys: string[],
  {
    enabled = true,
    visibleIntervalMs = 5000,
    hiddenIntervalMs = 20000,
    onVersionsChanged,
  }: UseSyncVersionsOptions,
) {
  const keysRef = useRef<string[]>(keys);
  const versionsRef = useRef<Record<string, number>>({});
  const callbackRef = useRef(onVersionsChanged);
  const initializedRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedKeysRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    callbackRef.current = onVersionsChanged;
  }, [onVersionsChanged]);

  const syncViaHttp = useCallback(async () => {
    try {
      const params = new URLSearchParams({ keys: keysRef.current.join(',') });
      const response = await platformFetch<SyncVersionsResponse>(`/sync/versions?${params.toString()}`);
      const nextVersions = response.data.versions ?? {};

      if (!initializedRef.current) {
        versionsRef.current = nextVersions;
        initializedRef.current = true;
      } else {
        const changedKeys = keysRef.current.filter((key) => (nextVersions[key] ?? 0) !== (versionsRef.current[key] ?? 0));
        versionsRef.current = nextVersions;
        if (changedKeys.length > 0) {
          await callbackRef.current(changedKeys, nextVersions);
        }
      }
    } catch {
      // no-op; next cycle will retry
    }
  }, []);

  const subscribeWsKeys = useCallback((ws: WebSocket, keysToSubscribe: string[]) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const newKeys = keysToSubscribe.filter((k) => !subscribedKeysRef.current.has(k));
    if (newKeys.length > 0) {
      ws.send(JSON.stringify({ type: 'subscribe', keys: newKeys }));
      for (const k of newKeys) subscribedKeysRef.current.add(k);
    }
  }, []);

  useEffect(() => {
    if (!enabled || keys.length === 0) return;

    let cancelled = false;
    let fallbackTimeoutId: number | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000;

    function connectWs() {
      if (cancelled) return;

      try {
        const ws = new WebSocket(getWsUrl());
        wsRef.current = ws;

        ws.onopen = () => {
          if (cancelled) { ws.close(); return; }
          reconnectAttempts = 0;
          setWsConnected(true);
          subscribeWsKeys(ws, keysRef.current);
        };

        ws.onmessage = async (evt) => {
          if (cancelled) return;
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'sync' && msg.keys && msg.versions) {
              const changedKeys = msg.keys as string[];
              const versions = msg.versions as Record<string, number>;
              versionsRef.current = { ...versionsRef.current, ...versions };
              await callbackRef.current(changedKeys, versionsRef.current);
            }
          } catch {
            // ignore malformed messages
          }
        };

        ws.onclose = () => {
          if (cancelled) return;
          setWsConnected(false);
          wsRef.current = null;
          subscribedKeysRef.current.clear();

          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            reconnectTimeoutRef.current = window.setTimeout(connectWs, delay);
          } else {
            startHttpFallback();
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        startHttpFallback();
      }
    }

    function startHttpFallback() {
      if (cancelled) return;
      const schedule = () => {
        if (cancelled) return;
        const delay = document.visibilityState === 'visible' ? visibleIntervalMs : hiddenIntervalMs;
        fallbackTimeoutId = window.setTimeout(async () => {
          if (cancelled) return;
          await syncViaHttp();
          schedule();
        }, delay);
      };
      schedule();
    }

    const handleVisibilityOrFocus = () => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        subscribeWsKeys(ws, keysRef.current);
      }
    };

    connectWs();
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      cancelled = true;
      if (fallbackTimeoutId != null) window.clearTimeout(fallbackTimeoutId);
      if (reconnectTimeoutRef.current != null) window.clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      subscribedKeysRef.current.clear();
      setWsConnected(false);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [enabled, keys, visibleIntervalMs, hiddenIntervalMs, syncViaHttp, subscribeWsKeys]);

  useEffect(() => {
    if (!wsConnected || keys.length === 0) return;
    const ws = wsRef.current;
    if (!ws) return;
    subscribeWsKeys(ws, keys);
  }, [keys, wsConnected, subscribeWsKeys]);

  return { wsConnected };
}
