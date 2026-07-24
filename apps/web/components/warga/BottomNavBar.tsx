'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, History, Home, UserRound, FileEdit } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getDraftCount } from '@/lib/draft-utils';

const NAV_ITEMS = [
  { href: '/warga', label: 'Home', icon: Home },
  { href: '/warga/history', label: 'Riwayat', icon: History },
  { href: '/warga/drafts', label: 'Draft', icon: FileEdit, showBadge: true },
  { href: '/warga/jadwal', label: 'Jadwal', icon: Calendar },
  { href: '/warga/settings', label: 'Profil', icon: UserRound },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    setDraftCount(getDraftCount(false));
    const interval = setInterval(() => {
      setDraftCount(getDraftCount(false));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-[max(env(safe-area-inset-bottom,0px),1.25rem)] left-0 z-50 w-full px-4">
      <nav className="pointer-events-auto mx-auto flex items-center justify-between gap-1
          h-16 w-full
          rounded-full border border-border
          bg-background p-1.5
          shadow-md backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/warga'
              ? pathname === '/warga' ||
                pathname.startsWith('/warga/aspirasi') ||
                pathname.startsWith('/warga/layanan')
              : pathname === item.href || pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                'h-16 rounded-full px-0 transition-all duration-300 ease-out',
                'hover:bg-muted hover:text-foreground',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

                isActive
                  ? 'w-auto min-w-20 justify-start gap-2 bg-primary px-4 text-primary-foreground shadow-md hover:bg-primary hover:text-primary-foreground'
                  : 'w-12 text-muted-foreground'
              )}
            >
              <Link
                href={item.href}
                aria-label={item.label}
                className="relative flex h-full w-full items-center justify-center gap-2"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.showBadge && draftCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {draftCount}
                  </span>
                )}

                {isActive && (
                  <span className="text-xs font-semibold tracking-tight">
                    {item.label}
                  </span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
