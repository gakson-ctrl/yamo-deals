import { formatFCFA } from '@/lib/format';

interface PriceTagProps {
  amount: number;
  label?: string;
  accent?: boolean;
}

export function PriceTag({ amount, label, accent = true }: PriceTagProps) {
  return (
    <span className="font-inter text-xs text-yamo-ash">
      {label && <span className="mr-0.5">{label}</span>}
      <span className={accent ? 'font-semibold text-yamo-mango' : 'font-medium'}>
        {formatFCFA(amount)}
      </span>
    </span>
  );
}
