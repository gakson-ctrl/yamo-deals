'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconX } from '@tabler/icons-react';

interface Props {
  restaurantId: string;
  onCreated: (cat: { id: string; name: string; display_order: number }) => void;
  onClose: () => void;
}

export function AddCategorySheet({ restaurantId, onCreated, onClose }: Props) {
  const t = useTranslations('menu');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErr(t('category_name') + ' requis');
      return;
    }

    setLoading(true);
    setErr('');

    const res = await fetch('/api/menu-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: restaurantId, name: trimmed }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Erreur' }));
      setErr((data as { error?: string }).error ?? 'Erreur');
      setLoading(false);
      return;
    }

    const { category_id } = await res.json() as { category_id: string };
    onCreated({ id: category_id, name: trimmed, display_order: 999 });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[80]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-yamo-white rounded-t-2xl z-[90]">
        <div className="w-10 h-1 bg-yamo-fog rounded-full mx-auto mt-3 mb-4" />

        <div className="flex items-center justify-between px-4 pb-4 border-b border-yamo-fog">
          <h2 className="font-sora font-semibold text-yamo-ebony">{t('add_category')}</h2>
          <button onClick={onClose} className="text-yamo-ash hover:text-yamo-ebony" aria-label="Fermer">
            <IconX size={20} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-yamo-ash mb-1">
              {t('category_name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && void handleCreate()}
              placeholder="Ex. Plats principaux"
              autoFocus
              className="w-full border border-yamo-fog rounded-yamo-input px-3 py-2.5 text-sm text-yamo-ebony focus:outline-none focus:border-yamo-red"
            />
          </div>

          {err && <p className="text-yamo-error text-sm">{err}</p>}

          <button
            onClick={() => void handleCreate()}
            disabled={loading}
            className="w-full bg-yamo-red text-yamo-white font-semibold py-3 rounded-yamo-pill disabled:opacity-60 transition-opacity"
          >
            {loading ? '…' : t('create_category')}
          </button>
        </div>

        <div className="h-6" />
      </div>
    </>
  );
}
