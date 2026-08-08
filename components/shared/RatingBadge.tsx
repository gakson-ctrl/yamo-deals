import { IconStarFilled } from '@tabler/icons-react';

interface RatingBadgeProps {
  rating: number | null;
  count?: number | null;
  size?: 'sm' | 'md';
}

export function RatingBadge({ rating, count, size = 'sm' }: RatingBadgeProps) {
  if (!rating) return null;
  const iconSize = size === 'sm' ? 12 : 14;
  return (
    <span className="flex items-center gap-0.5">
      <IconStarFilled size={iconSize} className="text-yamo-mango" />
      <span className="font-inter font-semibold text-yamo-ebony text-xs">
        {rating.toFixed(1)}
      </span>
      {count != null && count > 0 && (
        <span className="font-inter text-yamo-ash text-xs">({count})</span>
      )}
    </span>
  );
}
