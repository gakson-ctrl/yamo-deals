'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconPlus, IconChevronDown, IconChevronUp, IconPencil } from '@tabler/icons-react';
import { formatFCFA } from '@/lib/format';
import { AddCategorySheet } from '@/components/merchant/AddCategorySheet';
import { AddEditItemSheet, type MenuItem } from '@/components/merchant/AddEditItemSheet';

export interface Category {
  id: string;
  name: string;
  display_order: number;
  items: MenuItem[];
}

interface Props {
  restaurantId: string;
  initialCategories: Category[];
}

export function MenuManagerClient({ restaurantId, initialCategories }: Props) {
  const t = useTranslations('menu');
  const tCommon = useTranslations('common');

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [defaultCatId, setDefaultCatId] = useState<string | undefined>(undefined);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const toggleCollapse = (catId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const openAddItem = (categoryId?: string) => {
    setEditingItem(null);
    setDefaultCatId(categoryId);
    setSheetMode('add');
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setDefaultCatId(item.category_id ?? undefined);
    setSheetMode('edit');
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const toggled = { ...item, is_available: !item.is_available };
    // Optimistic update
    setCategories(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(i => (i.id === item.id ? toggled : i)),
    })));

    const res = await fetch(`/api/menu-items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         item.name,
        description:  item.description,
        price:        item.price,
        image_url:    item.image_url,
        is_available: !item.is_available,
        category_id:  item.category_id,
      }),
    });

    if (!res.ok) {
      // Revert on failure
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(i => (i.id === item.id ? item : i)),
      })));
    }
  };

  const handleItemSaved = (savedItem: MenuItem) => {
    setCategories(prev => {
      if (sheetMode === 'add') {
        return prev.map(cat =>
          cat.id === savedItem.category_id
            ? { ...cat, items: [...cat.items, savedItem] }
            : cat
        );
      }
      return prev.map(cat => ({
        ...cat,
        items: cat.items.map(i => (i.id === savedItem.id ? savedItem : i)),
      }));
    });
    setSheetMode(null);
  };

  const handleCategoryCreated = (cat: { id: string; name: string; display_order: number }) => {
    setCategories(prev => [...prev, { ...cat, items: [] }]);
    setShowCategorySheet(false);
  };

  const allCategoryOptions = categories.map(cat => ({ id: cat.id, name: cat.name }));

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora text-xl font-bold text-yamo-ebony">{t('title')}</h1>
        <button
          onClick={() => openAddItem()}
          className="flex items-center gap-1.5 bg-yamo-red text-yamo-white text-sm font-semibold px-4 py-2 rounded-yamo-pill"
        >
          <IconPlus size={16} />
          {t('add_item')}
        </button>
      </div>

      {/* Category list */}
      {categories.length === 0 ? (
        <p className="text-yamo-ash text-sm text-center py-10">{t('no_categories')}</p>
      ) : (
        categories.map(cat => (
          <div key={cat.id} className="mb-3">
            {/* Category header */}
            <button
              className="w-full flex items-center justify-between bg-yamo-white rounded-yamo-card px-4 py-3 shadow-sm"
              onClick={() => toggleCollapse(cat.id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-sora font-semibold text-yamo-ebony">{cat.name}</span>
                <span className="bg-yamo-fog text-yamo-ash text-xs px-2 py-0.5 rounded-full leading-none">
                  {cat.items.length}
                </span>
              </div>
              {collapsed.has(cat.id)
                ? <IconChevronDown size={18} className="text-yamo-ash" />
                : <IconChevronUp size={18} className="text-yamo-ash" />
              }
            </button>

            {/* Item rows */}
            {!collapsed.has(cat.id) && (
              <div className="bg-yamo-white rounded-b-yamo-card shadow-sm overflow-hidden">
                {cat.items.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-yamo-ash">{t('no_items')}</p>
                ) : (
                  <ul className="divide-y divide-yamo-fog">
                    {cat.items.map(item => (
                      <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                        {/* Thumbnail */}
                        <div className="w-[60px] h-[60px] rounded-yamo-chip flex-shrink-0 overflow-hidden bg-gradient-to-br from-yamo-mango-light to-yamo-red-light">
                          {item.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Name + price */}
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-medium text-sm text-yamo-ebony truncate">{item.name}</p>
                          <p className="text-yamo-red text-sm font-semibold mt-0.5">{formatFCFA(item.price)}</p>
                        </div>

                        {/* Available toggle */}
                        <button
                          type="button"
                          onClick={() => void handleToggleAvailability(item)}
                          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                            item.is_available ? 'bg-yamo-fern' : 'bg-yamo-fog'
                          }`}
                          aria-label={item.is_available ? t('available') : t('unavailable')}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 bg-yamo-white rounded-full shadow transition-transform ${
                            item.is_available ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditItem(item)}
                          className="text-yamo-ash hover:text-yamo-ebony flex-shrink-0 p-1"
                          aria-label={tCommon('edit')}
                        >
                          <IconPencil size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {/* Add category CTA */}
      <button
        onClick={() => setShowCategorySheet(true)}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-yamo-fog text-yamo-ash rounded-yamo-card py-4 text-sm font-medium mt-4 hover:border-yamo-red hover:text-yamo-red transition-colors"
      >
        <IconPlus size={16} />
        {t('add_category')}
      </button>

      {/* Sheets */}
      {sheetMode && (
        <AddEditItemSheet
          mode={sheetMode}
          initialItem={editingItem ?? undefined}
          defaultCategoryId={defaultCatId}
          categories={allCategoryOptions}
          restaurantId={restaurantId}
          onSaved={handleItemSaved}
          onClose={() => setSheetMode(null)}
        />
      )}

      {showCategorySheet && (
        <AddCategorySheet
          restaurantId={restaurantId}
          onCreated={handleCategoryCreated}
          onClose={() => setShowCategorySheet(false)}
        />
      )}
    </div>
  );
}
