'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowClockwise as RefreshCw,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  ChartBar,
  DownloadSimple as Download,
  Eye,
  FileText,
  Funnel,
  MagnifyingGlass as Search,
  Users,
} from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { platformFetch } from '@/lib/api/platform';

const PAGE_SIZE = 20;
const MONTH_OPTIONS = [
  { value: '', label: 'Pilih Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
] as const;

type SummaryData = {
  stats: {
    totalWarga: number;
    totalKK: number;
    totalMutasi: number;
    pendingRequests: number;
  };
};

type RtRow = {
  rt: string;
  rw: string;
  kk: number;
  warga: number;
  mutasi: number;
  produktif: number;
};

type CitizenRow = {
  id: string;
  nik: string;
  name: string;
  address: string;
  status: string;
  gender: string;
  birthDate: string;
  rt: string;
  rw: string;
};

type DemographicsData = {
  totalCitizens: number;
  ageGroups: Array<{ label: '0-12' | '13-17' | '18-35' | '36-59' | '60+'; value: number }>;
  gender: {
    male: number;
    female: number;
  };
};

type DistributionItem = {
  label: string;
  value: number;
  share: number;
};

type AnalyticsData = {
  totalCitizens: number;
  productiveAge: number;
  children: number;
  seniors: number;
  occupation: DistributionItem[];
  education: DistributionItem[];
  religion: DistributionItem[];
  maritalStatus: DistributionItem[];
  bloodType: DistributionItem[];
  residentStatus: DistributionItem[];
};

const EMPTY_DEMOGRAPHICS: DemographicsData = {
  totalCitizens: 0,
  ageGroups: [
    { label: '0-12', value: 0 },
    { label: '13-17', value: 0 },
    { label: '18-35', value: 0 },
    { label: '36-59', value: 0 },
    { label: '60+', value: 0 },
  ],
  gender: { male: 0, female: 0 },
};

const EMPTY_ANALYTICS: AnalyticsData = {
  totalCitizens: 0,
  productiveAge: 0,
  children: 0,
  seniors: 0,
  occupation: [],
  education: [],
  religion: [],
  maritalStatus: [],
  bloodType: [],
  residentStatus: [],
};

function buildFilterParams(filter: { tahun: string; bulan: string; rt: string }) {
  const params = new URLSearchParams();
  if (filter.tahun) params.set('tahun', filter.tahun);
  if (filter.bulan) params.set('bulan', filter.bulan);
  if (filter.rt) params.set('rt', filter.rt);
  return params;
}

function formatCitizenStatusLabel(value: string) {
  if (value === 'PENDUDUK_TETAP') return 'Penduduk Tetap';
  if (value === 'NGEKOST') return 'Ngekost';
  return value.replaceAll('_', ' ');
}

function formatDistributionLabel(section: string, label: string) {
  if (section === 'residentStatus') return formatCitizenStatusLabel(label);
  if (label === 'BELUM_KAWIN') return 'Belum Kawin';
  if (label === 'CERAI_HIDUP') return 'Cerai Hidup';
  if (label === 'CERAI_MATI') return 'Cerai Mati';
  return label;
}

function DistributionPanel({
  title,
  items,
  section,
  tone = 'blue',
  emptyLabel,
}: {
  title: string;
  items: DistributionItem[];
  section: 'occupation' | 'education' | 'religion' | 'maritalStatus' | 'bloodType' | 'residentStatus';
  tone?: 'blue' | 'green' | 'rose';
  emptyLabel: string;
}) {
  const palette =
    tone === 'green'
      ? {
          bar: 'from-[#22C55E] to-[#16A34A]',
          track: 'bg-[#DCFCE7]',
          pill: 'bg-[#DCFCE7] text-[#166534]',
        }
      : tone === 'rose'
        ? {
            bar: 'from-[#F472B6] to-[#EC4899]',
            track: 'bg-[#FCE7F3]',
            pill: 'bg-[#FCE7F3] text-[#9D174D]',
          }
        : {
            bar: 'from-[#60A5FA] to-[#2563EB]',
            track: 'bg-[#DBEAFE]',
            pill: 'bg-[#EFF6FF] text-[#1D4ED8]',
          };

  const visibleItems = items.slice(0, 6);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1E293B]">{title}</h3>
          <p className="mt-1 text-xs text-[#64748B]">Menampilkan kategori terbesar dari data aktif sesuai filter.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${palette.pill}`}>
          {items.length} kategori
        </span>
      </div>

      {visibleItems.length > 0 ? (
        <div className="space-y-4">
          {visibleItems.map((item) => (
            <div key={`${section}-${item.label}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-[#1E293B]">{formatDistributionLabel(section, item.label)}</span>
                <span className="text-xs font-semibold text-[#64748B]">
                  {item.value} warga • {item.share.toFixed(1)}%
                </span>
              </div>
              <div className={`h-2.5 overflow-hidden rounded-full ${palette.track}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${palette.bar}`}
                  style={{ width: `${Math.min(item.share, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] px-4 py-10 text-center text-sm text-[#64748B]">
          {emptyLabel}
        </div>
      )}
    </div>
  );
}

function SpotlightCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] to-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">{title}</p>
      <p className="mt-3 text-xl font-bold text-[#1E293B]">{value}</p>
      <p className="mt-2 text-sm text-[#64748B]">{helper}</p>
    </div>
  );
}

export default function RapotPage() {
  const [tahun, setTahun] = useState('2026');
  const [bulan, setBulan] = useState('');
  const [rt, setRt] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'livelihood' | 'social'>('overview');
  const [stats, setStats] = useState<SummaryData['stats']>({
    totalWarga: 0,
    totalKK: 0,
    totalMutasi: 0,
    pendingRequests: 0,
  });
  const [rtData, setRtData] = useState<RtRow[]>([]);
  const [demographics, setDemographics] = useState<DemographicsData>(EMPTY_DEMOGRAPHICS);
  const [analytics, setAnalytics] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [viewedRT, setViewedRT] = useState<RtRow | null>(null);
  const [rtCitizens, setRtCitizens] = useState<CitizenRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTotalItems, setDetailTotalItems] = useState(0);
  const [detailTotalPages, setDetailTotalPages] = useState(1);
  const [appliedFilter, setAppliedFilter] = useState({
    tahun: '2026',
    bulan: '',
    rt: '',
  });

  const activeFilter = useMemo(() => {
    const bulanLabel = MONTH_OPTIONS.find((option) => option.value === appliedFilter.bulan)?.label ?? 'Semua Bulan';
    return `${bulanLabel} ${appliedFilter.tahun}${appliedFilter.rt ? ` - RT ${appliedFilter.rt}` : ''}`;
  }, [appliedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const summaryParams = buildFilterParams(appliedFilter);
        const query = summaryParams.size ? `?${summaryParams.toString()}` : '';
        const [summaryResponse, rtResponse, demographicResponse, analyticsResponse] = await Promise.all([
          platformFetch<SummaryData>('/admin/reports/summary'),
          platformFetch<RtRow[]>(`/admin/reports/rt-breakdown${query}`),
          platformFetch<DemographicsData>(`/admin/reports/demographics${query}`),
          platformFetch<AnalyticsData>(`/admin/reports/analytics${query}`),
        ]);

        if (!active) return;
        setStats(summaryResponse.data.stats);
        setRtData(rtResponse.data);
        setDemographics(demographicResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error(error);
        if (!active) return;
        setStats({ totalWarga: 0, totalKK: 0, totalMutasi: 0, pendingRequests: 0 });
        setRtData([]);
        setDemographics(EMPTY_DEMOGRAPHICS);
        setAnalytics(EMPTY_ANALYTICS);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [appliedFilter]);

  useEffect(() => {
    if (!viewedRT) return;
    let active = true;
    const rtId = viewedRT.rt;

    async function loadRtCitizens() {
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });
        if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
        if (appliedFilter.tahun) params.set('tahun', appliedFilter.tahun);
        if (appliedFilter.bulan) params.set('bulan', appliedFilter.bulan);
        const response = await platformFetch<CitizenRow[]>(`/admin/reports/rt/${rtId}/citizens?${params.toString()}`);
        if (!active) return;
        setRtCitizens(response.data);
        setDetailTotalItems(response.meta?.total ?? response.data.length);
        setDetailTotalPages(response.meta?.totalPages ?? 1);
      } catch (error) {
        console.error(error);
        if (!active) return;
        setRtCitizens([]);
        setDetailTotalItems(0);
        setDetailTotalPages(1);
      }
    }

    void loadRtCitizens();
    return () => {
      active = false;
    };
  }, [viewedRT, currentPage, debouncedSearchQuery, appliedFilter]);

  const ageGroups = demographics.ageGroups;
  const maxAgeValue = Math.max(...ageGroups.map((group) => group.value), 1);
  const lakiLaki = demographics.gender.male;
  const perempuan = demographics.gender.female;
  const genderTotal = lakiLaki + perempuan || 1;
  const exportParams = buildFilterParams(appliedFilter);
  const exportQuery = exportParams.size ? `?${exportParams.toString()}` : '';
  const totalKK = rtData.reduce((acc, row) => acc + row.kk, 0);
  const totalWarga = rtData.reduce((acc, row) => acc + row.warga, 0);
  const totalMutasi = rtData.reduce((acc, row) => acc + row.mutasi, 0);
  const totalProduktif = rtData.reduce((acc, row) => acc + row.produktif, 0);
  const rwValues = Array.from(new Set(rtData.map((row) => row.rw)));
  const totalLabel = appliedFilter.rt
    ? `Total RT ${appliedFilter.rt}`
    : rwValues.length === 1 && rwValues[0]
      ? `Total RW ${rwValues[0]}`
      : 'Total Semua RT';

  const primaryOccupation = analytics.occupation[0];
  const primaryEducation = analytics.education[0];
  const primaryReligion = analytics.religion[0];
  const residentMix = analytics.residentStatus[0];

  const handleApplyFilter = () => {
    setAppliedFilter({ tahun, bulan, rt });
  };

  const handleOpenDetail = async (row: RtRow) => {
    setViewedRT(row);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[clamp(14px,1.5vw,18px)] font-bold text-[#1E293B]">Laporan Data Warga Siap Cetak</h2>
          <p className="mt-1 text-sm font-medium text-[#3B82F6]">Filter Aktif: {activeFilter}</p>
          <p className="mt-1 text-xs text-[#64748B]">
            Kartu ringkasan menampilkan total data aktif saat ini. Filter hanya berlaku untuk rekap, detail RT, infografis, dan ekspor.
          </p>
        </div>
        <div className="flex min-w-[280px] flex-col items-stretch gap-2 rounded-2xl border border-[#DBEAFE] bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">Ekspor Laporan</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => window.open(`/api/platform/admin/reports/export/pdf${exportQuery}`, '_blank')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
            >
              <Download className="h-4 w-4" />
              Unduh PDF
            </Button>
            <Button
              onClick={() => window.open(`/api/platform/admin/reports/export/csv${exportQuery}`, '_blank')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EFF6FF] px-4 py-2.5 text-sm font-semibold text-[#2563EB] transition hover:bg-[#DBEAFE]"
            >
              <Download className="h-4 w-4" />
              Unduh CSV
            </Button>
          </div>
          <p className="text-xs text-[#64748B]">File mengikuti filter bulan, tahun, dan RT yang sedang aktif.</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="h-10 rounded-xl border-0 bg-[#3B82F6] px-4 text-sm font-medium text-white outline-none"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#64748B] outline-none"
          >
            {MONTH_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={rt}
            onChange={(e) => setRt(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#64748B] outline-none"
          >
            <option value="">Pilih RT</option>
            <option value="01">RT 01</option>
            <option value="02">RT 02</option>
            <option value="03">RT 03</option>
          </select>
          <Button
            onClick={handleApplyFilter}
            className="h-10 rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
          >
            <Funnel className="mr-2 h-4 w-4" />
            Terapkan
          </Button>
        </div>

        <div className="rounded-2xl border border-dashed border-[#BFDBFE] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">Ketersediaan Data</p>
          <p className="mt-2 text-sm font-semibold text-[#1E293B]">Base salary / income range belum tersedia di master warga.</p>
          <p className="mt-1 text-xs text-[#64748B]">
            Halaman ini hanya menampilkan sumber data warga yang kanonik. Jika nanti ingin ada analitik gaji, perlu sumber data khusus dan endpoint terpisah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-5 text-white">
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/[0.04]" />
          <div className="relative z-10">
            <Users className="mb-2 h-5 w-5 text-white/60" />
            <p className="text-xs text-white/70">Total warga</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalWarga} <span className="text-sm font-medium">Jiwa</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-5 text-white">
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/[0.04]" />
          <div className="relative z-10">
            <FileText className="mb-2 h-5 w-5 text-white/60" />
            <p className="text-xs text-white/70">Total KK</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalKK} <span className="text-sm font-medium">Kartu Keluarga</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-5 text-white">
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/[0.04]" />
          <div className="relative z-10">
            <RefreshCw className="mb-2 h-5 w-5 text-white/60" />
            <p className="text-xs text-white/70">Total Mutasi</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalMutasi} <span className="text-sm font-medium">Laporan</span></p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-5 text-white">
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/[0.04]" />
          <div className="relative z-10">
            <ChartBar className="mb-2 h-5 w-5 text-white/60" />
            <p className="text-xs text-white/70">Permohonan Pending</p>
            <p className="mt-1 text-2xl font-bold">{stats.pendingRequests} <span className="text-sm font-medium">Antrian</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SpotlightCard
          title="Usia Produktif"
          value={`${analytics.productiveAge} Jiwa`}
          helper={`${analytics.totalCitizens > 0 ? ((analytics.productiveAge / analytics.totalCitizens) * 100).toFixed(1) : '0.0'}% dari warga aktif di filter ini.`}
        />
        <SpotlightCard
          title="Pekerjaan Dominan"
          value={primaryOccupation ? formatDistributionLabel('occupation', primaryOccupation.label) : 'Belum ada data'}
          helper={primaryOccupation ? `${primaryOccupation.value} warga` : 'Lengkapi data pekerjaan warga untuk melihat pola.'}
        />
        <SpotlightCard
          title="Pendidikan Dominan"
          value={primaryEducation ? formatDistributionLabel('education', primaryEducation.label) : 'Belum ada data'}
          helper={primaryEducation ? `${primaryEducation.value} warga` : 'Lengkapi data pendidikan warga untuk melihat pola.'}
        />
        <SpotlightCard
          title="Komposisi Terbesar"
          value={residentMix ? formatDistributionLabel('residentStatus', residentMix.label) : 'Belum ada data'}
          helper={residentMix ? `${residentMix.share.toFixed(1)}% dari warga aktif` : 'Belum ada status kependudukan yang dapat diringkas.'}
        />
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as typeof activeView)} className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-2xl border border-gray-100 bg-white p-2">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="livelihood" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Pekerjaan & Pendidikan
          </TabsTrigger>
          <TabsTrigger value="social" className="rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">
            Sosial & Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="mb-6 text-base font-bold text-[#1E293B]">Distribusi Kelompok Umur</h3>
              <div className="flex items-end justify-between gap-4" style={{ height: 'clamp(150px, 25vh, 200px)' }}>
                {ageGroups.map((group) => {
                  const isHighest = group.value === maxAgeValue && maxAgeValue > 0;
                  return (
                    <div key={group.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${isHighest ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-[#EFF6FF] text-[#3B82F6]'}`}>
                        {group.value} Jiwa
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                          isHighest
                            ? 'bg-gradient-to-t from-[#3B82F6] to-[#2563EB] shadow-[0_-4px_10px_rgba(37,99,235,0.2)]'
                            : 'bg-[#93C5FD] opacity-80'
                        }`}
                        style={{ height: `${(group.value / maxAgeValue) * 100}%`, minHeight: '16px' }}
                      />
                      <span className={`text-xs transition-colors ${isHighest ? 'font-bold text-[#2563EB]' : 'font-medium text-[#64748B]'}`}>{group.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden flex flex-col items-center justify-center rounded-2xl bg-[#2563EB] p-6 text-white">
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/[0.06]" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/[0.06]" />
              <div className="relative z-10 flex w-full flex-col items-center">
                <h3 className="mb-6 self-start text-base font-bold">Komposisi Gender</h3>
                <div className="relative">
                  <div
                    className="h-44 w-44 rounded-full"
                    style={{
                      background: `conic-gradient(#86EFAC 0% ${(lakiLaki / genderTotal) * 100}%, #F9A8D4 ${(lakiLaki / genderTotal) * 100}% 100%)`,
                    }}
                  />
                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[#2563EB]">
                    <span className="text-[11px] text-white/60">dari Total</span>
                    <span className="text-lg font-bold">{demographics.totalCitizens} Jiwa</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#86EFAC]" />
                    <span>Laki-Laki <span className="font-bold">{Math.round((lakiLaki / genderTotal) * 100)}%</span> ({lakiLaki} Jiwa)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#F9A8D4]" />
                    <span>Perempuan <span className="font-bold">{Math.round((perempuan / genderTotal) * 100)}%</span> ({perempuan} Jiwa)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <DistributionPanel
              title="Top Pekerjaan"
              items={analytics.occupation}
              section="occupation"
              tone="blue"
              emptyLabel="Belum ada distribusi pekerjaan untuk filter ini."
            />
            <DistributionPanel
              title="Agama Warga"
              items={analytics.religion}
              section="religion"
              tone="green"
              emptyLabel="Belum ada distribusi agama untuk filter ini."
            />
          </div>
        </TabsContent>

        <TabsContent value="livelihood" className="mt-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <DistributionPanel
              title="Sebaran Pekerjaan"
              items={analytics.occupation}
              section="occupation"
              tone="blue"
              emptyLabel="Belum ada distribusi pekerjaan untuk filter ini."
            />
            <DistributionPanel
              title="Sebaran Pendidikan"
              items={analytics.education}
              section="education"
              tone="green"
              emptyLabel="Belum ada distribusi pendidikan untuk filter ini."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SpotlightCard
              title="Kelompok Anak"
              value={`${analytics.children} Jiwa`}
              helper="Warga usia 0-17 tahun pada filter aktif."
            />
            <SpotlightCard
              title="Kelompok Produktif"
              value={`${analytics.productiveAge} Jiwa`}
              helper="Warga usia 18-59 tahun pada filter aktif."
            />
            <SpotlightCard
              title="Kelompok Lansia"
              value={`${analytics.seniors} Jiwa`}
              helper="Warga usia 60 tahun ke atas pada filter aktif."
            />
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <DistributionPanel
              title="Status Kependudukan"
              items={analytics.residentStatus}
              section="residentStatus"
              tone="blue"
              emptyLabel="Belum ada status kependudukan untuk filter ini."
            />
            <DistributionPanel
              title="Status Perkawinan"
              items={analytics.maritalStatus}
              section="maritalStatus"
              tone="rose"
              emptyLabel="Belum ada status perkawinan untuk filter ini."
            />
            <DistributionPanel
              title="Golongan Darah"
              items={analytics.bloodType}
              section="bloodType"
              tone="green"
              emptyLabel="Belum ada golongan darah untuk filter ini."
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <DistributionPanel
              title="Agama"
              items={analytics.religion}
              section="religion"
              tone="green"
              emptyLabel="Belum ada distribusi agama untuk filter ini."
            />
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6">
              <h3 className="text-base font-bold text-[#1E293B]">Catatan Sumber Data</h3>
              <div className="mt-4 space-y-3 text-sm text-[#64748B]">
                <p>Semua grafik di halaman ini memakai data warga aktif yang sama dengan dashboard admin.</p>
                <p>Filter bulan dan tahun membaca periode pembuatan data warga untuk kebutuhan rekap dan analitik halaman ini.</p>
                <p>Jika ingin analitik pendapatan atau base salary, itu harus datang dari domain data terpisah dan tidak boleh dicampur ke master warga tanpa definisi yang jelas.</p>
                <p className="font-medium text-[#1E293B]">
                  Agama dominan: {primaryReligion ? formatDistributionLabel('religion', primaryReligion.label) : 'Belum ada data'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div>
        <h3 className="mb-4 text-base font-bold text-[#1E293B]">Rekapitulasi Per RT</h3>
        <div className="overflow-x-auto overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#2563EB]">
                <th className="px-5 py-4 text-left font-semibold">Wilayah</th>
                <th className="px-5 py-4 text-left font-semibold">Kepala Keluarga</th>
                <th className="px-5 py-4 text-left font-semibold">Total warga</th>
                <th className="px-5 py-4 text-left font-semibold">Total Mutasi</th>
                <th className="px-5 py-4 text-left font-semibold">Usia Produktif</th>
                <th className="px-5 py-4 text-left font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rtData.map((row) => (
                <tr key={`${row.rt}-${row.rw}`} className="border-b border-gray-100 bg-white">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1E293B]">RT {row.rt}</p>
                    <p className="text-xs font-medium text-[#94A3B8]">RW {row.rw}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#1E293B]">{row.kk}</td>
                  <td className="px-5 py-4 font-semibold text-[#1E293B]">{row.warga}</td>
                  <td className="px-5 py-4 font-semibold text-[#1E293B]">{row.mutasi}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#E0E7FF] px-3 py-1 text-xs font-bold text-[#4F46E5]">{row.produktif} Jiwa</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      onClick={() => void handleOpenDetail(row)}
                      className="inline-flex items-center justify-center rounded-xl bg-white p-2 text-[#3B82F6] shadow-sm ring-1 ring-inset ring-gray-200 transition hover:bg-gray-50"
                      title="Lihat Detail Warga"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-inner">
                <td className="px-5 py-4 text-sm font-semibold">{totalLabel}</td>
                <td className="px-5 py-4 font-bold">{totalKK}</td>
                <td className="px-5 py-4 font-bold">{totalWarga}</td>
                <td className="px-5 py-4 font-bold">{totalMutasi}</td>
                <td className="px-5 py-4 font-bold">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">{totalProduktif} Jiwa</span>
                </td>
                <td className="px-5 py-4 text-right"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!viewedRT} onOpenChange={(open) => !open && setViewedRT(null)}>
        <DialogContent className="max-w-4xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1E293B]">Detail Warga - RT {viewedRT?.rt} / RW {viewedRT?.rw}</DialogTitle>
            <DialogDescription className="text-sm text-[#64748B]">Menampilkan rincian data penduduk untuk wilayah RT {viewedRT?.rt}.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#3B82F6] focus:bg-white"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EFF6FF] text-[#1E293B]">
                    <th className="px-4 py-3 text-left font-semibold">Nama Penduduk</th>
                    <th className="px-4 py-3 text-left font-semibold">NIK</th>
                    <th className="px-4 py-3 text-left font-semibold">Alamat</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rtCitizens.length > 0 ? (
                    rtCitizens.map((citizen) => (
                      <tr key={citizen.id} className="border-t border-gray-100 bg-white">
                        <td className="px-4 py-3 font-medium text-[#1E293B]">{citizen.name}</td>
                        <td className="px-4 py-3 text-[#64748B]">{citizen.nik}</td>
                        <td className="px-4 py-3 text-[#64748B]">{citizen.address}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">{formatCitizenStatusLabel(citizen.status)}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#64748B]">Data tidak ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {detailTotalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-[#64748B]">
                  Menampilkan {rtCitizens.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, detailTotalItems)} dari {detailTotalItems} warga
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-[#1E293B]">Hal {currentPage} / {detailTotalPages}</span>
                  <Button
                    onClick={() => setCurrentPage((page) => Math.min(detailTotalPages, page + 1))}
                    disabled={currentPage === detailTotalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
