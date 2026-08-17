interface BakingHoursCardProps {
  totalSeconds: number | null;
}

function formatHours(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

export function BakingHoursCard({ totalSeconds }: BakingHoursCardProps) {
  const display =
    totalSeconds !== null && totalSeconds >= 0 ? formatHours(totalSeconds) : "---";

  return (
    <div className="card baking-hours-card">
      <span className="baking-hours-card__label">Horneada</span>
      <span className="baking-hours-card__value">{display}</span>
    </div>
  );
}
