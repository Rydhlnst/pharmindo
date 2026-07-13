'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarBlank as CalendarDays, MapPin } from '@phosphor-icons/react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { platformFetch } from '@/lib/api/platform';

type PemiluEvent = {
  id: string;
  title: string;
  requirements: string[];
  pollingStations: Array<{ label: string; location: string; assignedRtScope: string[] }>;
  electionDate: string;
  startTime: string | null;
  endTime: string | null;
};

export default function AdminPemiluDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<PemiluEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await platformFetch<PemiluEvent>(`/admin/pemilu/${id}`);
        if (!active) return;
        setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="p-8 text-slate-500">Memuat detail pemilu...</div>;
  if (!item) return <div className="p-8 text-slate-500">Data pemilu tidak ditemukan.</div>;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/pemilu" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <Card className="rounded-3xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[color:var(--admin-heading)]">{item.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[color:var(--admin-subtle)]">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(item.electionDate).toLocaleDateString('id-ID')}</span>
          <span>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : 'Jam belum diatur'}</span>
          <Badge variant="secondary">{item.pollingStations.length} TPS</Badge>
        </div>
      </Card>

      <Card className="rounded-3xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[color:var(--admin-heading)]">Persyaratan</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-[color:var(--admin-body)]">
          {item.requirements.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </Card>

      <div className="grid gap-3">
        <h2 className="text-lg font-bold text-[color:var(--admin-heading)]">Tempat Pemungutan Suara</h2>
        {item.pollingStations.map((s) => (
          <Card key={s.label} className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-surface-soft)] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[color:var(--admin-heading)]">{s.label}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-[color:var(--admin-subtle)]">
                  <MapPin className="h-4 w-4" /> {s.location}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit rounded-full shadow-none">
                {s.assignedRtScope.map((rt) => `RT ${rt}`).join(', ')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
