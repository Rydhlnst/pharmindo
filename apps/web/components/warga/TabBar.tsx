'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  className?: string;
}

export default function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = buttonRefs.current[activeTab];
    const container = scrollRef.current;
    if (!el || !container) return;
    const elLeft = el.offsetLeft;
    const elWidth = el.offsetWidth;
    const containerWidth = container.offsetWidth;
    container.scrollTo({
      left: elLeft - containerWidth / 2 + elWidth / 2,
      behavior: 'smooth',
    });
  }, [activeTab]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Container rounded */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-1.5 shadow-sm">
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab}
              ref={(el) => { buttonRefs.current[index] = el; }}
              type="button"
              onClick={() => onTabChange(index)}
              className={cn(
                'shrink-0 rounded-xl py-2 px-3.5 text-[13px] font-medium text-center whitespace-nowrap transition-all duration-150',
                index === activeTab
                  ? 'border border-[#3B82F6] bg-white text-[#1D4ED8] font-semibold shadow-sm'
                  : 'border border-transparent text-[#64748B] hover:text-[#374151]',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Glass fade hint kanan */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-10 rounded-r-2xl"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(248,250,252,0.92))',
        }}
      />
    </div>
  );
}