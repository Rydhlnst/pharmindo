'use client';

import { Megaphone, X } from 'lucide-react';
import { BroadcastItem } from '@/lib/dummy-broadcast';
import { cn } from '@/lib/utils';

interface BroadcastBannerProps {
  broadcast: BroadcastItem;
  onOpen: (id: string) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

export default function BroadcastBanner({ broadcast, onOpen, onDismiss, className }: BroadcastBannerProps) {
  return (
    <div
      onClick={() => onOpen(broadcast.id)}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98] animate-in slide-in-from-left-full duration-500",
        className
      )}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.08]" />
      <div className="pointer-events-none absolute right-10 top-10 h-12 w-12 rounded-full bg-white/[0.12]" />

      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
        <Megaphone className="h-6 w-6 text-white" />
        <span className="absolute right-0 top-0 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
        </span>
      </div>

      <div className="relative z-10 flex-1 min-w-0 pr-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100 mb-0.5">
          Info Kehilangan • RT {broadcast.reporterRT}
        </p>
        <p className="truncate text-sm font-bold leading-tight text-white">
          {broadcast.itemName}
        </p>
        <p className="truncate text-xs font-medium text-white/80 mt-0.5">
          Lokasi: {broadcast.location}
        </p>
      </div>

      <button
        onClick={(e) => onDismiss(broadcast.id, e)}
        className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/20 hover:text-white"
        aria-label="Tutup pemberitahuan"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
