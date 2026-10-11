export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-bold text-stone-800">
          <span>{label}</span>
          <span className="text-emerald-800 font-black">{safe}%</span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200/90 ring-1 ring-emerald-900/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-amber-700 transition-all duration-300 shadow-sm"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}