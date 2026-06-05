'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarBlank as Calendar,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  ClipboardText as ClipboardList,
  FileArrowDown as FileInput,
  Flag,
  IdentificationCard as IdCard,
  SquaresFour as LayoutDashboard,
  SignOut as LogOut,
  List as Menu,
  ArrowClockwise as RefreshCw,
  Gear as Settings,
  ShieldCheck,
  TrendUp as TrendingUp,
  Book,
  HandCoins,
  Users,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { platformFetch } from '@/lib/api/platform';
import { authClient } from '@/lib/auth-client';
import { useSyncVersions } from '@/lib/use-sync-versions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import PortalBrand from '@/components/ui/portal-brand';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasNotification?: boolean;
  highlight?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Data Utama',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/data-penduduk', label: 'Data Penduduk', icon: Users, highlight: true },
      { href: '/admin/kartu-keluarga', label: 'Kartu Keluarga', icon: ClipboardList },
      { href: '/admin/mutasi', label: 'Mutasi Penduduk', icon: RefreshCw },
    ],
  },
  {
    label: 'Layanan & Program',
    items: [
      { href: '/admin/kegiatan', label: 'Kegiatan RW', icon: Calendar },
      { href: '/admin/bansos', label: 'Bansos', icon: HandCoins },
      { href: '/admin/pemilu', label: 'Pemilu', icon: Flag },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { href: '/admin/verification', label: 'Verifikasi Warga', icon: ShieldCheck, hasNotification: true },
      { href: '/admin/permohonan', label: 'Permohonan', icon: FileInput, hasNotification: true },
      { href: '/admin/laporan', label: 'Laporan', icon: TrendingUp },
      { href: '/admin/rapot-rw', label: 'Rapot RW', icon: Book },
    ],
  },
];

const SYSTEM_NAV: NavItem[] = [
  { href: '/admin/hak-akses', label: 'Kelola Hak Akses', icon: IdCard },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

function AdminNavContent({ isCollapsed = false, mobile = false }: { isCollapsed?: boolean; mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [hasPendingVerifications, setHasPendingVerifications] = useState(false);

  const loadNotificationBadges = async () => {
    try {
      const [requestsResponse, verificationsResponse] = await Promise.all([
        platformFetch<unknown[]>('/admin/requests?page=1&limit=1&status=PENDING'),
        platformFetch<unknown[]>('/admin/verifications?status=PENDING'),
      ]);
      setHasPendingRequests(requestsResponse.data.length > 0);
      setHasPendingVerifications(verificationsResponse.data.length > 0);
    } catch {
      // silently ignore error
    }
  };

  useEffect(() => {
    void loadNotificationBadges();
  }, []);

  useSyncVersions(['admin:dashboard'], {
    onVersionsChanged: async (changedKeys) => {
      if (!changedKeys.includes('admin:dashboard')) return;
      await loadNotificationBadges();
    },
  });

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const showNotification =
      item.href === '/admin/permohonan'
        ? hasPendingRequests
        : item.href === '/admin/verification'
          ? hasPendingVerifications
          : item.hasNotification;

    // Highlight "Data Penduduk" with a special pill style
    const isHighlight = item.highlight;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'group relative flex items-center rounded-xl px-3 py-2.5 text-sm transition-all',
          isCollapsed && !mobile ? 'justify-center' : 'gap-3',
          active
            ? isHighlight
              ? 'bg-blue-600 font-semibold text-white shadow-sm shadow-blue-500/30'
              : 'bg-[color:var(--admin-primary-soft)] font-semibold text-[color:var(--admin-primary)]'
            : isHighlight
              ? 'border border-blue-100 bg-blue-50/70 font-medium text-blue-700 hover:bg-blue-100 hover:text-blue-800'
              : 'text-[color:var(--admin-subtle)] hover:bg-[color:var(--admin-surface-soft)] hover:text-[color:var(--admin-heading)]',
        )}
      >
        <div className="relative flex items-center justify-center">
          <Icon className={cn('h-5 w-5 shrink-0', active && isHighlight ? 'text-white' : isHighlight && !active ? 'text-blue-600' : '')} />
          {showNotification ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            </span>
          ) : null}
        </div>
        {(!isCollapsed || mobile) && (
          <span className={cn('flex-1 truncate', active && isHighlight ? 'text-white' : '')}>{item.label}</span>
        )}
        {(!isCollapsed || mobile) && isHighlight && !active && (
          <span className="ml-auto shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-600">
            Utama
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex h-full flex-col gap-0.5">
      {/* Nav Groups */}
      <div className="flex flex-col gap-4 flex-1">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {/* Group Label */}
            {(!isCollapsed || mobile) && (
              <p className={cn(
                'mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest',
                groupIdx === 0 ? 'text-blue-500' : 'text-[color:var(--admin-subtle)]/60'
              )}>
                {group.label}
              </p>
            )}
            {isCollapsed && !mobile && groupIdx > 0 && (
              <div className="mx-2 my-2 h-px bg-[color:var(--admin-border)]" />
            )}
            <div className="space-y-0.5">
              {group.items.map(renderItem)}
            </div>
          </div>
        ))}
      </div>

      {/* System & Logout */}
      <div className="mt-auto border-t border-[color:var(--admin-border)] pt-3 space-y-0.5">
        {(!isCollapsed || mobile) && (
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-[color:var(--admin-subtle)]/60">
            Sistem
          </p>
        )}
        {SYSTEM_NAV.map(renderItem)}
        <Button
          variant="ghost"
          onClick={async () => {
            await authClient.signOut().catch(() => null);
            router.push('/sign-in');
          }}
          className={cn(
            'flex h-auto w-full items-center justify-start rounded-xl px-3 py-2.5 text-sm font-normal text-[color:var(--admin-subtle)] transition-colors hover:bg-rose-50 hover:text-rose-600',
            isCollapsed && !mobile ? 'justify-center' : 'gap-3',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!isCollapsed || mobile) && <span>Keluar</span>}
        </Button>
      </div>
    </nav>
  );
}

export function AdminMobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl border-[color:var(--admin-border)] bg-[color:var(--admin-surface)] text-[color:var(--admin-heading)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] border-r border-[color:var(--admin-border)] bg-[color:var(--admin-surface-muted)] p-0">
        <div className="flex h-full flex-col p-5">
          <SheetHeader className="border-b border-[color:var(--admin-border)] pb-4 text-left">
            <SheetTitle asChild>
              <PortalBrand
                imageSize={32}
                textClassName="text-base font-semibold text-[color:var(--admin-heading)]"
                subtitle="Admin dashboard"
                subtitleClassName="text-xs text-[color:var(--admin-subtle)]"
              />
            </SheetTitle>
          </SheetHeader>
          <div className="mt-5 flex-1 overflow-y-auto">
            <AdminNavContent mobile />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-r border-[color:var(--admin-border)] bg-[color:var(--admin-surface-muted)] backdrop-blur lg:flex',
        isCollapsed ? 'w-[72px]' : 'w-[264px]',
      )}
    >
      <div className="flex h-full w-full flex-col p-4">
        {/* Logo / Brand */}
        <div className={cn('mb-5 flex items-center', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed ? (
            <PortalBrand
              imageSize={32}
              textClassName="text-sm font-bold text-[color:var(--admin-heading)]"
              subtitle="Admin dashboard"
              subtitleClassName="text-[10px] text-[color:var(--admin-subtle)]"
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="h-8 w-8 shrink-0 rounded-xl text-[color:var(--admin-subtle)] hover:bg-[color:var(--admin-surface-soft)] hover:text-[color:var(--admin-heading)]"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AdminNavContent isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
