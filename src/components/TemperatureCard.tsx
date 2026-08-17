import type { Trend } from "../hooks/useHorno";

const TREND_CONFIG: Record<Trend, { arrow: string; color: string }> = {
  up: { arrow: "\u25B2", color: "#3fb950" },
  down: { arrow: "\u25BC", color: "#f85149" },
  stable: { arrow: "\u2192", color: "#e6edf3" },
};

interface TemperatureCardProps {
  label?: string;
  temp: number | null;
  trend: Trend;
}

export function TemperatureCard({ label = "Temperatura actual", temp, trend }: TemperatureCardProps) {
  const { arrow, color } = TREND_CONFIG[trend];

  return (
    <div className="card temperature-card">
      <span className="temperature-card__label">{label}</span>
      <span className="temperature-card__value" style={{ color }}>
        {temp !== null ? temp : "---"}
        <span className="temperature-card__unit">°C</span>
        <span className="temperature-card__arrow">{arrow}</span>
      </span>
    </div>
  );
}
