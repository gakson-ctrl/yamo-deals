'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface PrepTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (prepTime: number) => void;
}

const PREP_OPTIONS = [10, 15, 20, 30];

export function PrepTimeModal({ isOpen, onClose, onConfirm }: PrepTimeModalProps) {
  const t = useTranslations('merchant');
  const [selected, setSelected] = useState(20);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="
        fixed left-1/2 -translate-x-1/2 bottom-0 z-[90]
        w-full max-w-[430px]
        bg-yamo-white rounded-t-2xl
        px-4 pt-6 pb-10
        shadow-xl
      ">
        <h3 className="font-sora font-bold text-lg text-yamo-ebony mb-5 text-center">
          {t('prep_time_title')}
        </h3>
        <div className="flex gap-3 justify-center mb-6">
          {PREP_OPTIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setSelected(mins)}
              className={`
                rounded-yamo-pill px-4 py-2.5 font-inter font-semibold text-sm
                transition-colors min-w-[60px]
                ${selected === mins
                  ? 'bg-yamo-red text-yamo-white'
                  : 'bg-yamo-fog text-yamo-ebony hover:bg-yamo-red-light'
                }
              `}
            >
              {mins} {t('min')}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { onConfirm(selected); onClose(); }}
          className="
            w-full h-12 rounded-yamo-pill
            bg-yamo-red hover:bg-yamo-red-hover
            text-yamo-white font-inter font-semibold
            transition-colors
          "
        >
          {t('prep_time_confirm')}
        </button>
      </div>
    </>
  );
}
