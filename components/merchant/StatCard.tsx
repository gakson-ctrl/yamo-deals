interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-yamo-white rounded-yamo-card p-4 flex flex-col gap-1 shadow-sm">
      <span className="text-yamo-ash font-inter text-xs font-medium leading-tight">{label}</span>
      <span className="font-sora font-bold text-xl text-yamo-ebony leading-tight">{value}</span>
      {sub && <span className="text-yamo-ash font-inter text-xs">{sub}</span>}
    </div>
  );
}
