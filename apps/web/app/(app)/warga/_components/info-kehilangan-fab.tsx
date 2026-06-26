"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

import { type BroadcastItem, DUMMY_BROADCASTS } from "@/lib/dummy-broadcast";
import SlideUpSheet from "@/components/warga/SlideUpSheet";
import BroadcastBanner from "@/components/warga/broadcast/BroadcastBanner";
import BroadcastDetailModal from "@/components/warga/broadcast/BroadcastDetailModal";
import FoundItemForm from "@/components/warga/broadcast/FoundItemForm";

// In a real app, this would come from an API/query hook instead of static dummy data.
function getInitialBroadcasts() {
  return DUMMY_BROADCASTS.filter((b) => b.status === "active" && !b.isRead);
}

export default function InfoKehilanganFab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>(getInitialBroadcasts);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
  }

  function handleFoundClick() {
    setIsModalOpen(false);
    setTimeout(() => setIsFormOpen(true), 150);
  }

  function handleFormSubmit(id: string) {
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
