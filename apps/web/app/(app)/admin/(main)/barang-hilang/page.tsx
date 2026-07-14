'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Archive, 
  CheckCircle, 
  ClockClockwise, 
  Files, 
  MagnifyingGlass, 
  WarningCircle, 
  Eye,
  Bag,
  DeviceMobile,
  Wallet,
  CarProfile,
  Question
} from '@phosphor-icons/react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { platformFetch } from '@/lib/api/platform';
import { useSyncVersions } from '@/lib/use-sync-versions';
import { mapBackendBarangHilang, type BackendBarangHilang } from '@/lib/barang-hilang-mapper';
import type { LaporanBarangHilang, ReportPriority, ReportStatus, StatsResponse } from '@/types/barang-hilang';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; badge: string }> = {
  pending_verification: { label: 'Menunggu Verifikasi', color: '#888780', badge: 'bg-gray-100 text-gray-600 border-gray-200' },
  in_verification: { label: 'Sedang Diverifikasi', color: '#378ADD', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  processing: { label: 'Sedang Diproses', color: '#BA7517', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  resolved: { label: 'Selesai', color: '#1D9E75', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Ditolak', color: '#E24B4A', badge: 'bg-red-100 text-red-700 border-red-200' },
  archived: { label: 'Diarsipkan', color: '#5F5E5A', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const PRIORITY_CONFIG: Record<ReportPriority, { label: string; badge: string }> = {
  low: { label: 'Rendah', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  medium: { label: 'Sedang', badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  high: { label: 'Tinggi', badge: 'bg-red-50 text-red-600 border-red-200' },
};

export default function LaporanBarangHilangPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | 'ALL'>('ALL');
  const [items, setItems] = useState<LaporanBarangHilang[]>([]);
  const [stats, setStats] = useState<StatsResponse['byStatus'] & { total: number }>({
    total: 0,
    pending_verification: 0,
    in_verification: 0,
    processing: 0,
    resolved: 0,
    rejected: 0,
    archived: 0,
  });

  const load = useCallback(async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        platformFetch<BackendBarangHilang[]>('/admin/barang-hilang?limit=100'),
        platformFetch<{ total: number; byStatus: Record<ReportStatus, number> }>('/admin/barang-hilang/stats'),
      ]);
      setItems((listRes.data ?? []).map(mapBackendBarangHilang));
      setStats({ total: statsRes.data.total, ...statsRes.data.byStatus });
    } catch (err) {
      console.error(err);
      setItems([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useSyncVersions(['admin:barang-hilang'], { onVersionsChanged: load });

  const filteredData = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
      
      return matchSearch && matchStatus && matchPriority;
    });
  }, [items, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Barang Hilang</h1>
          <p className="text-sm text-slate-500 mt-1">Tinjau, verifikasi, dan sebarkan informasi kehilangan kepada warga RW 025.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Laporan"
          value={stats.total}
          icon={Files}
          delta={stats.total}
          deltaSuffix="Laporan"
          bg="bg-gradient-to-br from-[#2563EB] to-[#3B82F6]"
        />
        <SummaryCard
          label="Menunggu Verifikasi"
          value={stats.pending_verification}
          icon={ClockClockwise}
          delta={stats.pending_verification}
          deltaSuffix="Baru"
          bg="bg-gradient-to-br from-[#4F86F0] to-[#6AA1F7]"
        />
        <SummaryCard
          label="Sedang Diproses"
          value={stats.processing}
          icon={WarningCircle}
          delta={stats.processing}
          deltaSuffix="Diproses"
          bg="bg-gradient-to-br from-[#7CA8F8] to-[#93BCF9]"
        />
        <SummaryCard
          label="Selesai Total"
          value={stats.resolved}
          icon={CheckCircle}
          delta={stats.resolved}
          deltaSuffix="Selesai"
          bg="bg-gradient-to-br from-[#2563EB] to-[#6AA1F7]"
        />
      </div>

      {/* Main Content Area */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari nama, tiket, atau barang..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-slate-200 bg-white"
            />
          </div>
          
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
          >
            <option value="ALL">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
              <option key={key} value={key}>{conf.label}</option>
            ))}
          </select>

          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as ReportPriority | 'ALL')}
          >
            <option value="ALL">Semua Prioritas</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
              <option key={key} value={key}>{conf.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3 border-b border-slate-100">Tiket</th>
                <th className="px-4 py-3 border-b border-slate-100">Pelapor</th>
                <th className="px-4 py-3 border-b border-slate-100">Barang</th>
                <th className="px-4 py-3 border-b border-slate-100">Tanggal Laporan</th>
                <th className="px-4 py-3 border-b border-slate-100">Prioritas</th>
                <th className="px-4 py-3 border-b border-slate-100">Status</th>
                <th className="px-4 py-3 border-b border-slate-100">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada laporan barang hilang yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const statusConf = STATUS_CONFIG[item.status];
                  const priorityConf = PRIORITY_CONFIG[item.priority];
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{item.ticketNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{item.reporter.name}</p>
                        <p className="text-xs text-slate-500">RT {item.reporter.rt}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{item.item.name}</p>
                        <p className="text-xs text-slate-500">{item.item.category}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`border shadow-none ${priorityConf.badge}`}>{priorityConf.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`border shadow-none ${statusConf.badge}`}>{statusConf.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/barang-hilang/${item.id}`}>
                          <Button size="sm" variant="outline" className="rounded-lg bg-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: IconComponent,
  delta,
  deltaSuffix,
  bg,
}: {
  label: string;
  value: number;
  icon: any;
  delta?: number;
  deltaSuffix?: string;
  bg: string;
}) {
  return (
    <div className={`group relative min-h-[116px] overflow-hidden rounded-2xl ${bg} p-4 text-white shadow-md transition-shadow hover:shadow-lg`}>
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.08]" />
      <div className="pointer-events-none absolute right-8 top-8 h-10 w-10 rounded-full bg-white/[0.05]" />

      <div className="relative z-10">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
            <IconComponent className="h-4 w-4 text-white" weight="duotone" />
          </div>
        </div>
        <p className="text-xs font-medium text-white/80">{label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
          {delta && delta > 0 ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              +{delta} {deltaSuffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
