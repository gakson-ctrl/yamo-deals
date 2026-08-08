import { IconClock, IconMotorbike } from '@tabler/icons-react';
import { formatFCFA } from '@/lib/format';

interface DeliveryBadgeProps {
  prepTime: number;
  deliveryFee: number;
}

export function DeliveryBadge({ prepTime, deliveryFee }: DeliveryBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-inter text-yamo-ash bg-yamo-fog px-2 py-1 rounded-yamo-chip">
      <span className="flex items-center gap-0.5">
        <IconClock size={11} aria-hidden />
        ~{prepTime} min
      </span>
      <span aria-hidden>·</span>
      <span className="flex items-center gap-0.5">
        <IconMotorbike size={11} aria-hidden />
        <span className="font-semibold text-yamo-mango">{formatFCFA(deliveryFee)}</span>
      </span>
    </span>
  );
}
