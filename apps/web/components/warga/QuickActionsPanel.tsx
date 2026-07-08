'use client';

import Link from 'next/link';
import {
  CalendarDays,
  ClipboardList,
  MessageSquareText,
  Sparkles,
  Users,
  ArrowRightLeft,
  FilePlus2,
  LockKeyhole,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import { MagnifyingGlass } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type QuickActionItem =
  | {
      key: string;
      label: string;
      desc: string;
      href: string;
      icon: any;
      soon?: false;
    }
  | {
      key: string;
      label: string;
      desc: string;
      icon: any;
      href?: string;
      action?: string;
      soon: true;
    }
  | {
      key: string;
      label: string;
      desc: string;
      icon: any;
      action: string;
      href?: never;
      soon?: false;
    };

const QUICK_ACTIONS: QuickActionItem[] = [
  // Baris 1: Layanan utama kependudukan
  {
    key: 'penduduk',
    label: 'Data Penduduk',
    desc: 'Data kependudukan',
    action: 'penduduk',
    icon: Users,
  },
  {
    key: 'mutasi',
    label: 'Mutasi',
    desc: 'Pindah/Datang',
    action: 'mutasi',
    icon: ArrowRightLeft,
  },
  {
    key: 'nambah_kk',
    label: 'Pengajuan KK',
    desc: 'Tambah KK & Anggota',
    action: 'tambahKk',
    icon: FilePlus2,
  },
  // Baris 2: Layanan pendukung
  {
    key: 'jadwal',
    label: 'Jadwal RW',
    desc: 'Kegiatan & acara',
    href: '/warga/jadwal',
    icon: CalendarDays,
  },
  {
    key: 'barang_hilang',
    label: 'Barang Hilang',
    desc: 'Laporan kehilangan',
    href: '/warga/barang-hilang',
    icon: MagnifyingGlass,
  },
  {
    key: 'aspirasi',
    label: 'Aspirasi',
    desc: 'Status & tanggapan',
    action: 'aspirasi',
    icon: MessageSquareText,
  },
];

const QUICK_ACTION_TONE_MAP: Record<
  string,
  {
    iconWrap: string;
    icon: string;
    chip: string;
    glow: string;
  }
> = {
  jadwal: {
    iconWrap: 'bg-[color:var(--accent-sky)]/10',
    icon: 'text-[color:var(--accent-sky)]',
    chip: 'bg-[color:var(--accent-sky)]/10 text-[color:var(--accent-sky)]',
    glow: 'bg-[color:var(--accent-sky)]/10',
  },
  barang_hilang: {
    iconWrap: 'bg-primary/10',
    icon: 'text-primary',
    chip: 'bg-primary/10 text-primary',
    glow: 'bg-primary/10',
  },
  aspirasi: {
    iconWrap: 'bg-primary/10',
    icon: 'text-primary',
    chip: 'bg-primary/10 text-primary',
    glow: 'bg-primary/10',
  },
  layanan: {
    iconWrap: 'bg-[color:var(--accent-mint)]/10',
    icon: 'text-[color:var(--accent-mint)]',
    chip: 'bg-[color:var(--accent-mint)]/10 text-[color:var(--accent-mint)]',
    glow: 'bg-[color:var(--accent-mint)]/10',
  },
  penduduk: {
    iconWrap: 'bg-blue-500/10',
    icon: 'text-blue-500',
    chip: 'bg-blue-500/10 text-blue-500',
    glow: 'bg-blue-500/10',
  },
  mutasi: {
    iconWrap: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-500',
    glow: 'bg-emerald-500/10',
  },
  nambah_kk: {
    iconWrap: 'bg-amber-500/10',
    icon: 'text-amber-500',
    chip: 'bg-amber-500/10 text-amber-500',
    glow: 'bg-amber-500/10',
  },
};

interface QuickActionsPanelProps {
  verificationStatus: string;
  onAction?: (action: string) => void;
}

export default function QuickActionsPanel({
  verificationStatus,
  onAction,
}: QuickActionsPanelProps) {
  const isTier1 = verificationStatus === 'NONE' || verificationStatus === 'REJECTED';
  const isTier2 = verificationStatus === 'PENDING';
  const isTier3 = verificationStatus === 'VERIFIED';

  return (
    <Card className="overflow-hidden rounded-4xl border-0 bg-card shadow-none px-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/70">
            {isTier1 ? (
              <LockKeyhole className="size-4 text-amber-500" />
            ) : isTier2 ? (
              <Hourglass className="size-4 text-amber-500" />
            ) : (
              <Sparkles className="size-4 text-primary" />
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Aksi cepat
            </p>
            <h2 className="mt-0.5 text-base font-bold tracking-tight text-foreground">
              Menu utama
            </h2>
          </div>
        </div>

        {isTier1 && (
          <Badge
            variant="secondary"
            className="border-0 bg-amber-500/10 text-amber-600 shadow-none"
          >
            {verificationStatus === 'REJECTED' ? 'Perbaiki NIK' : 'Isi NIK'}
          </Badge>
        )}
        {isTier2 && (
          <Badge
            variant="secondary"
            className="border-0 bg-amber-500/10 text-amber-600 shadow-none"
          >
            Menunggu verifikasi
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-6 pt-2">
        <div className="grid grid-cols-3 gap-x-2 gap-y-6">
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            const isSoon = 'soon' in item && item.soon;
            const tone =
              QUICK_ACTION_TONE_MAP[item.key] ?? QUICK_ACTION_TONE_MAP.barang_hilang;

            const content = (
              <div className="group flex flex-col items-center justify-start gap-2">
                <div
                  className={cn(
                    'flex size-14 items-center justify-center rounded-[1.25rem] transition-all duration-300',
                    !isSoon && 'group-hover:scale-110 group-hover:shadow-sm group-active:scale-95',
                    tone.iconWrap,
                    tone.icon,
                    isSoon && 'opacity-50 grayscale'
                  )}
                >
                  <Icon className="size-6" strokeWidth={1.5} />
                </div>
                <span className={cn(
                  "text-center text-[11px] font-semibold leading-tight transition-colors",
                  isSoon ? "text-muted-foreground/50" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>
              </div>
            );

              if ('href' in item && item.href && !isSoon) {
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="shrink-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {content}
                  </Link>
                );
              }
              if ('action' in item && item.action && !isSoon) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onAction?.(item.action)}
                    className="shrink-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {content}
                  </button>
                );
              }
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled
                  className="focus-visible:outline-none"
                >
                  {content}
                </button>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
