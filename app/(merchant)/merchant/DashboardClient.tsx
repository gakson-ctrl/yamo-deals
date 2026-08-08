'use client';
import { useState } from 'react';

interface DashboardClientProps {
  restaurantId: string;
  restaurantName: string;
  initialIsOpen: boolean;
  tOnline: string;
  tOffline: string;
}

export function DashboardClient({
  restaurantId,
  restaurantName,
  initialIsOpen,
  tOnline,
  tOffline,
}: DashboardClientProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    const next = !isOpen;
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: next }),
      });
      if (res.ok) setIsOpen(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-yamo-white rounded-yamo-card px-4 py-3 mb-4 shadow-sm">
      <span className="font-sora font-bold text-base text-yamo-ebony truncate mr-3">
        {restaurantName}
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={toggle}
        className={`
          flex items-center gap-2 rounded-yamo-pill px-4 py-2
          font-inter font-semibold text-sm
          transition-colors disabled:opacity-60 shrink-0
          ${isOpen
            ? 'bg-yamo-fern-light text-yamo-fern'
            : 'bg-yamo-fog text-yamo-ash'
          }
        `}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-yamo-fern' : 'bg-yamo-ash'}`} />
        {isOpen ? tOnline : tOffline}
      </button>
    </div>
  );
}
