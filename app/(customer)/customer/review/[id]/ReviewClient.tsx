'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { IconCheck } from '@tabler/icons-react';

interface Props {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  alreadyReviewed: boolean;
}

export function ReviewClient({ orderId, restaurantId, restaurantName, alreadyReviewed }: Props) {
  const t = useTranslations('review');
  const tCommon = useTranslations('common');

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(alreadyReviewed);

  const handleSubmit = async () => {
    if (rating === 0) { setErr('Veuillez sélectionner une note'); return; }
    setLoading(true);
    setErr('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        restaurant_id: restaurantId,
        rating,
        comment: comment.trim() || undefined,
      }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const json = await res.json() as { error?: string };
      setErr(json.error ?? tCommon('error'));
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-yamo-cream flex flex-col items-center justify-center px-6 gap-5 pb-24">
        <div className="w-20 h-20 rounded-full bg-yamo-fern-light flex items-center justify-center">
          <IconCheck size={40} className="text-yamo-fern" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className="font-sora font-bold text-xl text-yamo-ebony mb-1">{t('thanks')}</p>
          <p className="font-inter text-sm text-yamo-ash">{restaurantName}</p>
        </div>
        <Link
          href="/customer"
          className="h-12 px-10 rounded-yamo-pill bg-yamo-red text-yamo-white font-sora font-semibold text-sm flex items-center justify-center"
        >
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-yamo-cream pb-24">

      {/* Cover gradient header */}
      <div className="h-[140px] bg-gradient-to-br from-yamo-mango-light to-yamo-red-light flex items-end px-4 pb-4">
        <h1 className="font-sora font-bold text-xl text-yamo-ebony leading-tight">
          {restaurantName}
        </h1>
      </div>

      <div className="px-4 pt-6 space-y-6">

        {/* Question */}
        <h2 className="font-sora font-bold text-lg text-yamo-ebony text-center">
          {t('question')}
        </h2>

        {/* Star selector */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(n => {
            const active = n <= (hover || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                className={`text-5xl leading-none transition-transform active:scale-90 hover:scale-110 ${
                  active ? 'text-yamo-mango' : 'text-yamo-fog'
                }`}
              >
                ★
              </button>
            );
          })}
        </div>

        {/* Comment */}
        <div>
          <label className="block font-inter text-sm font-medium text-yamo-ebony mb-2">
            {t('comment_label')}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={t('comment_placeholder')}
            rows={4}
            className="w-full rounded-yamo-input border border-yamo-fog px-3 py-2.5 text-sm font-inter text-yamo-ebony placeholder:text-yamo-ash focus:outline-none focus:border-yamo-red resize-none"
          />
        </div>

        {err && (
          <p className="font-inter text-xs text-yamo-error text-center">{err}</p>
        )}

        {/* Submit */}
        <button
          type="button"
          disabled={loading || rating === 0}
          onClick={() => void handleSubmit()}
          className="w-full h-12 rounded-yamo-pill bg-yamo-red text-yamo-white font-sora font-semibold text-base disabled:opacity-50 transition-opacity"
        >
          {loading ? '…' : t('submit')}
        </button>

        {/* Skip */}
        <Link
          href="/customer/orders"
          className="block text-center font-inter text-sm text-yamo-ash py-1"
        >
          {t('skip')}
        </Link>

      </div>
    </div>
  );
}
