'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconMapPin, IconX, IconTrash, IconCheck, IconChevronRight } from '@tabler/icons-react';
import type { SavedAddress } from '@/lib/supabase/types';

interface Props {
  initialAddresses: SavedAddress[];
  onClose: () => void;
}

type FormData = { street: string; district: string; instructions: string; isDefault: boolean };
const EMPTY_FORM: FormData = { street: '', district: '', instructions: '', isDefault: false };

async function patchAddresses(addresses: SavedAddress[]): Promise<boolean> {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saved_addresses: addresses }),
  });
  return res.ok;
}

export function AddressSheet({ initialAddresses, onClose }: Props) {
  const t = useTranslations('address');
  const tCommon = useTranslations('common');

  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErr('');
    setMode('add');
  };

  const openEdit = (addr: SavedAddress) => {
    setForm({
      street: addr.street,
      district: addr.district,
      instructions: addr.instructions ?? '',
      isDefault: addr.is_default,
    });
    setEditingId(addr.id);
    setErr('');
    setMode('edit');
  };

  const handleSave = async () => {
    if (!form.street.trim() || !form.district.trim()) {
      setErr('Rue et quartier requis');
      return;
    }
    setLoading(true);
    setErr('');

    let updated: SavedAddress[];

    if (mode === 'add') {
      const newAddr: SavedAddress = {
        id: crypto.randomUUID(),
        street: form.street.trim(),
        district: form.district.trim(),
        instructions: form.instructions.trim() || undefined,
        is_default: form.isDefault,
      };
      updated = form.isDefault
        ? [...addresses.map(a => ({ ...a, is_default: false })), newAddr]
        : [...addresses, newAddr];
    } else {
      updated = addresses.map(a =>
        a.id === editingId
          ? {
              ...a,
              street: form.street.trim(),
              district: form.district.trim(),
              instructions: form.instructions.trim() || undefined,
              is_default: form.isDefault,
            }
          : form.isDefault ? { ...a, is_default: false } : a,
      );
    }

    const ok = await patchAddresses(updated);
    if (ok) {
      setAddresses(updated);
      setMode('list');
    } else {
      setErr(tCommon('error'));
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const updated = addresses.filter(a => a.id !== id);
    const ok = await patchAddresses(updated);
    if (ok) setAddresses(updated);
    setConfirmDeleteId(null);
    setLoading(false);
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map(a => ({ ...a, is_default: a.id === id }));
    const ok = await patchAddresses(updated);
    if (ok) setAddresses(updated);
  };

  const isFormMode = mode === 'add' || mode === 'edit';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
                      bg-yamo-white rounded-t-[24px] max-h-[85dvh] flex flex-col">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-yamo-fog" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-yamo-fog flex-shrink-0">
          {isFormMode ? (
            <button
              type="button"
              onClick={() => setMode('list')}
              className="font-inter text-sm text-yamo-red font-medium"
            >
              {tCommon('back')}
            </button>
          ) : (
            <span />
          )}
          <h2 className="font-sora font-bold text-base text-yamo-ebony">
            {isFormMode
              ? mode === 'add' ? t('add') : tCommon('edit')
              : t('title')}
          </h2>
          <button
            type="button"
            onClick={isFormMode ? () => setMode('list') : onClose}
            className="p-1 text-yamo-ash"
            aria-label={tCommon('close')}
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">

          {/* ── List mode ──────────────────────────────── */}
          {mode === 'list' && (
            <>
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <IconMapPin size={32} className="text-yamo-fog" />
                  <p className="font-inter text-sm text-yamo-ash">{t('no_addresses')}</p>
                </div>
              ) : (
                <ul className="space-y-2 mb-4">
                  {addresses.map(addr => (
                    <li key={addr.id} className="bg-yamo-cream rounded-yamo-card p-3">
                      <div className="flex items-start gap-2">
                        <IconMapPin size={16} className="text-yamo-red flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-medium text-sm text-yamo-ebony truncate">
                            {addr.street}
                          </p>
                          <p className="font-inter text-xs text-yamo-ash">{addr.district}</p>
                          {addr.instructions && (
                            <p className="font-inter text-xs text-yamo-ash italic mt-0.5">{addr.instructions}</p>
                          )}
                          {addr.is_default && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-yamo-chip bg-yamo-fern-light text-yamo-fern text-[10px] font-semibold">
                              {t('default')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => void handleSetDefault(addr.id)}
                              className="p-1.5 rounded-full text-yamo-ash hover:text-yamo-fern"
                              title={t('set_default')}
                            >
                              <IconCheck size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEdit(addr)}
                            className="p-1.5 rounded-full text-yamo-ash hover:text-yamo-ebony"
                          >
                            <IconChevronRight size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(addr.id)}
                            className="p-1.5 rounded-full text-yamo-ash hover:text-yamo-error"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Delete confirm inline */}
                      {confirmDeleteId === addr.id && (
                        <div className="mt-2 flex gap-2 items-center">
                          <p className="flex-1 font-inter text-xs text-yamo-error">{t('confirm_delete')}</p>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void handleDelete(addr.id)}
                            className="px-3 py-1 rounded-yamo-pill bg-yamo-error text-white text-xs font-semibold"
                          >
                            {t('delete')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1 rounded-yamo-pill bg-yamo-fog text-yamo-ebony text-xs font-semibold"
                          >
                            {tCommon('cancel')}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                onClick={openAdd}
                className="w-full h-11 rounded-yamo-pill bg-yamo-red text-white font-inter font-semibold text-sm"
              >
                + {t('add')}
              </button>
            </>
          )}

          {/* ── Form mode (add / edit) ──────────────────── */}
          {isFormMode && (
            <div className="space-y-4">
              <div>
                <label className="block font-inter text-xs text-yamo-ash mb-1">{t('street')}</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                  placeholder="Ex. Rue des Ambassades"
                  className="w-full rounded-yamo-input border border-yamo-fog px-3 py-2.5 text-sm font-inter text-yamo-ebony placeholder:text-yamo-ash focus:outline-none focus:border-yamo-red"
                />
              </div>

              <div>
                <label className="block font-inter text-xs text-yamo-ash mb-1">{t('district')}</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="Ex. Bastos"
                  className="w-full rounded-yamo-input border border-yamo-fog px-3 py-2.5 text-sm font-inter text-yamo-ebony placeholder:text-yamo-ash focus:outline-none focus:border-yamo-red"
                />
              </div>

              <div>
                <label className="block font-inter text-xs text-yamo-ash mb-1">{t('instructions')}</label>
                <textarea
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  placeholder="Ex. Maison verte au fond de la cour"
                  rows={2}
                  className="w-full rounded-yamo-input border border-yamo-fog px-3 py-2.5 text-sm font-inter text-yamo-ebony placeholder:text-yamo-ash focus:outline-none focus:border-yamo-red resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                  className="w-4 h-4 accent-yamo-red"
                />
                <span className="font-inter text-sm text-yamo-ebony">{t('set_default')}</span>
              </label>

              {err && <p className="font-inter text-xs text-yamo-error">{err}</p>}

              <button
                type="button"
                disabled={loading}
                onClick={() => void handleSave()}
                className="w-full h-11 rounded-yamo-pill bg-yamo-red text-white font-inter font-semibold text-sm disabled:opacity-60 mt-2"
              >
                {loading ? '…' : t('save')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
