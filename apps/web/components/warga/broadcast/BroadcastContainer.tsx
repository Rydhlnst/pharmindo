'use client';

import { useState, useEffect } from 'react';
import { BroadcastItem, DUMMY_BROADCASTS } from '@/lib/dummy-broadcast';
import BroadcastBanner from './BroadcastBanner';
import BroadcastDetailModal from './BroadcastDetailModal';
import FoundItemForm from './FoundItemForm';

export default function BroadcastContainer() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [selectedBroadcast, setSelectedBroadcast] = useState<BroadcastItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load broadcasts on mount
  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we use the dummy data and only show active, unread ones
    const activeUnread = DUMMY_BROADCASTS.filter(b => b.status === 'active' && !b.isRead);
    setBroadcasts(activeUnread);
  }, []);

  const handleOpenDetail = (id: string) => {
    const broadcast = broadcasts.find(b => b.id === id);
    if (broadcast) {
      setSelectedBroadcast(broadcast);
      setIsModalOpen(true);
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail modal
    
    // Optimistically remove from UI
    setBroadcasts(prev => prev.filter(b => b.id !== id));
    
    // In a real app, call API to mark as read/dismissed
  };

  const handleFoundClick = (broadcast: BroadcastItem) => {
    setIsModalOpen(false);
    // Add a slight delay before opening the sheet for smoother transition
    setTimeout(() => {
      setIsFormOpen(true);
    }, 150);
  };

  const handleFormSubmit = (id: string) => {
    setIsFormOpen(false);
    setSelectedBroadcast(null);
    
    // Remove the broadcast from the banner list since it's now handled
    setBroadcasts(prev => prev.filter(b => b.id !== id));
  };

  if (broadcasts.length === 0) return null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3">
        {broadcasts.map(broadcast => (
          <BroadcastBanner 
            key={broadcast.id}
            broadcast={broadcast}
            onOpen={handleOpenDetail}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

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
