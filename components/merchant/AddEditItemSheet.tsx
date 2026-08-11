'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { IconX, IconCamera } from '@tabler/icons-react';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  mode: 'add' | 'edit';
  initialItem?: MenuItem;
  defaultCategoryId?: string;
  categories: Category[];
  restaurantId: string;
  onSaved: (item: MenuItem) => void;
  onClose: () => void;
}

export function AddEditItemSheet({
  mode,
  initialItem,
  defaultCategoryId,
  categories,
  restaurantId,
  onSaved,
  onClose,
}: Props) {
  const t = useTranslations('menu');
  const tCommon = useTranslations('common');

  const firstCatId = initialItem?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? '';

  const [name, setName] = useState(initialItem?.name ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '');
  const [categoryId, setCategoryId] = useState(firstCatId);
  const [isAvailable, setIsAvailable] = useState(initialItem?.is_available ?? true);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialItem?.image_url ?? null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedPrice = parseInt(price, 10);

    if (!trimmedName) { setErr(t('item_name') + ' requis'); return; }
    if (isNaN(parsedPrice) || parsedPrice <= 0) { setErr(t('item_price') + ' invalide'); return; }

    setLoading(true);
    setErr('');

    let imageUrl = initialItem?.image_url ?? null;

    if (pendingFile) {
      const supabase = createClient();
      const ext = pendingFile.name.split('.').pop() ?? 'jpg';
      const path = `${restaurantId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('menu-items')
        .upload(path, pendingFile, { upsert: true });

      if (uploadErr) {
        setErr('Erreur upload photo');
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('menu-items').getPublicUrl(path);
      imageUrl = publicUrl;
    }

    const bodyPayload = {
      restaurant_id: restaurantId,
      name:          trimmedName,
      description:   description.trim() || null,
      price:         parsedPrice,
      image_url:     imageUrl,
      is_available:  isAvailable,
      category_id:   categoryId || null,
    };

    const url   = mode === 'add' ? '/api/menu-items' : `/api/menu-items/${initialItem!.id}`;
    const method = mode === 'add' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Erreur' }));
      setErr((data as { error?: string }).error ?? 'Erreur');
      setLoading(false);
      return;
    }

    const data = await res.json() as { item_id?: string };
    const itemId = mode === 'add' ? (data.item_id ?? '') : initialItem!.id;

    onSaved({
      id:          itemId,
      name:        trimmedName,
      description: description.trim() || null,
      price:       parsedPrice,
      image_url:   imageUrl,
      is_available: isAvailable,
      category_id: categoryId || null,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[80]" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-yamo-white rounded-t-2xl z-[90] max-h-[92dvh] overflow-y-auto">
        <div className="w-10 h-1 bg-yamo-fog rounded-full mx-auto mt-3 mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-yamo-fog">
          <h2 className="font-sora font-semibold text-yamo-ebony">
            {mode === 'add' ? t('add_item') : tCommon('edit')}
          </h2>
          <button onClick={onClose} className="text-yamo-ash hover:text-yamo-ebony" aria-label="Fermer">
            <IconX size={20} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Photo */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 rounded-yamo-card bg-yamo-cream border-2 border-dashed border-yamo-fog flex flex-col items-center justify-center overflow-hidden"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <>
                <IconCamera size={28} className="text-yamo-ash mb-2" />
                <span className="text-yamo-ash text-sm">{t('photo_hint')}</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-yamo-ash mb-1">{t('item_name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex. Ndolé au poulet"
              className="w-full border border-yamo-fog rounded-yamo-input px-3 py-2.5 text-sm text-yamo-ebony focus:outline-none focus:border-yamo-red"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-yamo-ash mb-1">{t('item_desc')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex. Avec plantain et bâtons de manioc"
              rows={2}
              className="w-full border border-yamo-fog rounded-yamo-input px-3 py-2.5 text-sm text-yamo-ebony focus:outline-none focus:border-yamo-red resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-yamo-ash mb-1">{t('item_price')}</label>
            <div className="flex items-center border border-yamo-fog rounded-yamo-input px-3 py-2.5 focus-within:border-yamo-red">
              <input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="1500"
                className="flex-1 text-sm text-yamo-ebony focus:outline-none bg-transparent"
              />
              <span className="text-yamo-ash text-sm ml-2 flex-shrink-0">FCFA</span>
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-yamo-ash mb-1">{t('item_category')}</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-yamo-fog rounded-yamo-input px-3 py-2.5 text-sm text-yamo-ebony focus:outline-none focus:border-yamo-red bg-yamo-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Available toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-yamo-ebony">
              {isAvailable ? t('available') : t('unavailable')}
            </span>
            <button
              type="button"
              onClick={() => setIsAvailable(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                isAvailable ? 'bg-yamo-fern' : 'bg-yamo-fog'
              }`}
              aria-label={isAvailable ? t('available') : t('unavailable')}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-yamo-white rounded-full shadow transition-transform ${
                isAvailable ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Error */}
          {err && <p className="text-yamo-error text-sm">{err}</p>}

          {/* Save */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={loading}
            className="w-full bg-yamo-red text-yamo-white font-semibold py-3 rounded-yamo-pill disabled:opacity-60 transition-opacity"
          >
            {loading ? tCommon('loading') : tCommon('save')}
          </button>
        </div>

        <div className="h-6" />
      </div>
    </>
  );
}
