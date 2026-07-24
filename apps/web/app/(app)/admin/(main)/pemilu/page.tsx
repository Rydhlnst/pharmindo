'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarBlank as CalendarDays, Flag, MapPin, PlusCircle } from '@phosphor-icons/react';

import AdminAsyncState from '@/components/admin/AdminAsyncState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getPlatformErrorMessage, platformFetch } from '@/lib/api/platform';
import { useSyncVersions } from '@/lib/use-sync-versions';

type PemiluEvent = {
  id: string;
  title: string;
  requirements: string[];
  pollingStations: Array<{ label: string; location: string; assignedRtScope: string[] }>;
  electionDate: string;
  startTime: string | null;
  endTime: string | null;
};

function formatTimeRange(startTime: string | null, endTime: string | null) {
  if (!startTime && !endTime) return 'Jam belum diatur';
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || endTime || 'Jam belum diatur';
}

export default function AdminPemiluPage() {
  const [items, setItems] = useState<PemiluEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await platformFetch<PemiluEvent[]>('/admin/pemilu?page=1&limit=50');
      setItems(response.data);
      setError(null);
    } catch (loadError) {
      setItems([]);
      setError(getPlatformErrorMessage(loadError, 'Gagal memuat data pemilu.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  useSyncVersions(['admin:dashboard'], { onVersionsChanged: load });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header Actions ── */}
      <div className="flex flex-wrap items-stretch gap-4">
        {/* Tambah Pemilu */}
        <Link
          href="/admin/pemilu/tambah"
          className="relative flex min-w-[200px] flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-[#2563EB] px-[clamp(16px,2vw,24px)] py-[clamp(12px,1.5vh,16px)] text-white transition hover:bg-[#1D4ED8] active:scale-[0.99]"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08]" />
          <div className="pointer-events-none absolute right-16 top-6 h-24 w-24 rounded-full bg-white/[0.12]" />
          <div className="pointer-events-none absolute -bottom-5 right-40 h-16 w-16 rounded-full bg-white/[0.08]" />

          <div className="relative z-10 flex h-[clamp(36px,5vh,48px)] w-[clamp(36px,5vh,48px)] items-center justify-center rounded-full bg-white/20">
            <PlusCircle className="h-5 w-5 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-[clamp(14px,1.5vw,20px)] font-bold">Tambah Pemilu</p>
            <p className="text-[clamp(11px,1vw,14px)] text-white/80">Kelola agenda dan persyaratan TPS</p>
          </div>
        </Link>
      </div>

      {error ? (
        <AdminAsyncState
          mode="error"
          page="Pemilu"
          action="memuat data pemilu"
          description={error}
          onRetry={() => {
            setLoading(true);
            setReloadKey((value) => value + 1);
          }}
        />
      ) : loading ? (
        <AdminAsyncState mode="loading" page="Pemilu" action="memuat data pemilu" />
      ) : items.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--admin-surface-soft)]">
            <Flag className="h-6 w-6 text-[color:var(--admin-muted)]" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[color:var(--admin-heading)]">Belum ada agenda pemilu</h3>
          <p className="mt-1 text-sm text-[color:var(--admin-subtle)]">Buat agenda pemilu pertama untuk menentukan TPS per RT.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Link key={item.id} href={`/admin/pemilu/${item.id}`} className="block">
            <Card className="rounded-3xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-6 shadow-sm transition hover:border-[color:var(--admin-primary)]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--admin-primary-soft)] text-[color:var(--admin-primary)]">
                    <Flag className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[color:var(--admin-heading)]">{item.title}</h2>
                      <Badge className="rounded-full border border-[color:var(--admin-primary-soft-border)] bg-[color:var(--admin-primary-soft)] text-[color:var(--admin-primary-soft-foreground)] shadow-none">
                        {item.pollingStations.length} TPS
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[color:var(--admin-subtle)]">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(item.electionDate).toLocaleDateString('id-ID')}
                      </span>
                      <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-soft)] px-4 py-3 text-sm text-[color:var(--admin-body)]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--admin-subtle)]">Persyaratan</p>
                  <p className="mt-1 font-semibold">{item.requirements.length} item</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {item.pollingStations.map((station) => (
                  <div key={`${item.id}-${station.label}`} className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-soft)] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-[color:var(--admin-heading)]">{station.label}</p>
                        <p className="mt-1 inline-flex items-center gap-2 text-sm text-[color:var(--admin-subtle)]">
                          <MapPin className="h-4 w-4" />
                          {station.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="w-fit rounded-full shadow-none">
                        {station.assignedRtScope.map((rt) => `RT ${rt}`).join(', ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
