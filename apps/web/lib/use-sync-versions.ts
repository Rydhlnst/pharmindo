'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    callbackRef.current = onVersionsChanged;
  }, [onVersionsChanged]);

  useEffect(() => {
    if (!enabled || keys.length === 0) return;

    let cancelled = false;
    let timeoutId: number | null = null;

    const schedule = () => {
      if (cancelled) return;
      const delay = document.visibilityState === 'visible' ? visibleIntervalMs : hiddenIntervalMs;
      timeoutId = window.setTimeout(tick, delay);
    };

    const tick = async () => {
      if (cancelled) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        schedule();
        return;
      }

      try {
        const params = new URLSearchParams({ keys: keysRef.current.join(',') });
        const response = await platformFetch<SyncVersionsResponse>(`/sync/versions?${params.toString()}`);
        if (cancelled) return;

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
      } finally {
        schedule();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      void tick();
    };

    void tick();
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      cancelled = true;
      if (timeoutId != null) window.clearTimeout(timeoutId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [enabled, hiddenIntervalMs, keys, visibleIntervalMs]);
}
