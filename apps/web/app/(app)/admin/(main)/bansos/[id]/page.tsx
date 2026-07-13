'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarBlank as CalendarDays, HandCoins, MapPin } from '@phosphor-icons/react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { platformFetch } from '@/lib/api/platform';

type BansosProgram = {
  id: string;
  title: string;
  assistanceType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  fundingSource: string;
  generalRequirements: string[];
  allowedRtScope: string[];
  createdAt: string;
  updatedAt: string;
};

export default function AdminBansosProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [program, setProgram] = useState<BansosProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await platformFetch<BansosProgram>(`/admin/bansos/${id}`);
        if (!active) return;
        setProgram(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="p-8 text-slate-500">Memuat detail program...</div>;
  if (!program) return <div className="p-8 text-slate-500">Program tidak ditemukan.</div>;

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <Link href="/admin/bansos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <HandCoins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{program.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Jenis: {program.assistanceType}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Periode</p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4" />
              {new Date(program.startDate).toLocaleDateString('id-ID')} - {new Date(program.endDate).toLocaleDateString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-slate-500">{program.startTime} - {program.endTime}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sumber Dana</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{program.fundingSource}</p>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Persyaratan Umum</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {program.generalRequirements.map((r) => (
            <li key={r} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {r}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Cakupan RT</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {program.allowedRtScope.map((rt) => (
            <Badge key={rt} className="rounded-full border border-blue-100 bg-blue-50 text-blue-600 shadow-none">
              <MapPin className="mr-1 h-3 w-3" /> RT {rt}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
