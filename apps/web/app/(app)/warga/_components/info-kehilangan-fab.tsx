"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing } from "lucide-react";

import { type BroadcastItem } from "@/lib/dummy-broadcast";
import { platformFetch } from "@/lib/api/platform";
import { useSyncVersions } from "@/lib/use-sync-versions";
import SlideUpSheet from "@/components/warga/SlideUpSheet";
import BroadcastBanner from "@/components/warga/broadcast/BroadcastBanner";
import BroadcastDetailModal from "@/components/warga/broadcast/BroadcastDetailModal";
import FoundItemForm from "@/components/warga/broadcast/FoundItemForm";

const DISMISSED_STORAGE_KEY = "abdimas:dismissed_broadcasts";

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // no-op
  }
}

type BackendBroadcast = {
  id: string;
  ticketNumber: string;
  itemName: string;
  itemDescription: string;
  itemColor: string | null;
  category: string;
  incidentDate: string;
  incidentTime: string | null;
  location: string;
  reporterRT: string;
  broadcastMessage: string;
  broadcastedAt: string;
  status: "active" | "found" | "expired";
  photos: Array<{ url: string }>;
};

export default function InfoKehilanganFab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    try {
      const res = await platformFetch<BackendBroadcast[]>("/barang-hilang/broadcasts/active");
      const dismissed = getDismissedIds();
      const items = (res.data ?? [])
        .filter((b) => b.status === "active" && !dismissed.has(b.id))
        .map((b) => ({
          ...b,
          itemColor: b.itemColor ?? "",
          incidentTime: b.incidentTime ?? "",
          targetRTs: [] as string[],
          isRead: false,
        }));
      setBroadcasts(items);
    } catch {
      // silently ignore - FAB won't show
    }
  }, []);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  useSyncVersions(["admin:barang-hilang"], {
    onVersionsChanged: useCallback(async (changedKeys: string[]) => {
      if (changedKeys.includes("admin:barang-hilang")) {
        await loadBroadcasts();
      }
    }, [loadBroadcasts]),
  });

  if (broadcasts.length === 0) return null;

  function handleOpenDetail(id: string) {
    const broadcast = broadcasts.find((b) => b.id === id);
    if (!broadcast) return;

    setIsSheetOpen(false);
    setTimeout(() => {
      setSelectedBroadcast(broadcast);
      setIsModalOpen(true);
    }, 150);
  }

  function handleDismiss(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const dismissed = getDismissedIds();
    dismissed.add(id);
    saveDismissedIds(dismissed);
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }

  function handleFoundClick() {
    setIsModalOpen(false);
    setTimeout(() => setIsFormOpen(true), 150);
  }

  function handleFormSubmit(id: string) {
    const dismissed = getDismissedIds();
    dismissed.add(id);
    saveDismissedIds(dismissed);
    setIsFormOpen(false);
    setSelectedBroadcast(null);
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-label={`${broadcasts.length} info kehilangan terbaru`}
        className="animate-pulse-glow absolute bottom-[calc(max(env(safe-area-inset-bottom,0px),1.25rem)+4.75rem)] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-900/30 transition-transform active:scale-95"
      >
        <BellRing className="size-6" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[11px] font-bold leading-none text-white">
          {broadcasts.length}
        </span>
      </button>

      <SlideUpSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Info Kehilangan"
        deskripsi="Laporan kehilangan barang dari warga sekitar."
      >
        <div className="flex flex-col gap-3">
          {broadcasts.map((broadcast) => (
            <BroadcastBanner
              key={broadcast.id}
              broadcast={broadcast}
              onOpen={handleOpenDetail}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      </SlideUpSheet>

      <BroadcastDetailModal
        broadcast={selectedBroadcast}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFoundClick={handleFoundClick}
      />

      <FoundItemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        broadcast={selectedBroadcast}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
