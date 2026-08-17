interface FaseCardProps {
  fase: string | null;
  timerRemainingSec: number | null;
  timerRunning: boolean;
  timerDurationMin: number;
  onTimerDurationChange: (min: number) => void;
  onTimerReset: () => void;
}

const FASE_COLORS: Record<string, string> = {
  secado: "#58a6ff",
  pre_sint: "#d29922",
  cuarzo: "#e3b341",
  sint_media: "#f85149",
  maduracion: "#bc8cff",
  soak: "#3fb950",
};

const FASE_LABELS: Record<string, string> = {
  secado: "Secado",
  pre_sint: "Pre-sinterización",
  cuarzo: "Cuarzo",
  sint_media: "Sinterización Media",
  maduracion: "Maduración",
  soak: "Soak",
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FaseCard({
  fase,
  timerRemainingSec,
  timerRunning,
  timerDurationMin,
  onTimerDurationChange,
  onTimerReset,
}: FaseCardProps) {
  const color = fase ? FASE_COLORS[fase] ?? "#8b949e" : "#8b949e";
  const label = fase ? FASE_LABELS[fase] ?? fase : "---";

  const expired = timerRemainingSec === 0;
  const warning = !expired && timerRunning && timerRemainingSec !== null && timerRemainingSec < 300;

  let timerColor = "#58a6ff";
  if (expired) timerColor = "#f85149";
  else if (warning) timerColor = "#d29922";

  return (
    <div className="card fase-card">
      <span className="fase-card__label">Fase</span>
      <span className="fase-card__value" style={{ color }}>
        <span className="fase-card__dot" style={{ backgroundColor: color }} />
        {label}
      </span>

      {timerRemainingSec !== null && (
        <div className="fase-card__timer">
          <span className="fase-card__timer-display" style={{ color: timerColor }}>
            {formatTime(timerRemainingSec)}
          </span>
          <span className="fase-card__timer-label">restantes</span>
        </div>
      )}

      <div className="fase-card__timer-config">
        <label className="fase-card__timer-label">Duración (min):</label>
        <input
          className="fase-card__timer-input"
          type="number"
          min={1}
          max={120}
          value={timerDurationMin}
          onChange={(e) => {
            const v = Math.max(1, Math.min(120, Number(e.target.value) || 1));
            onTimerDurationChange(v);
          }}
        />
        <button className="fase-card__timer-btn" onClick={onTimerReset} title="Reiniciar timer">
          ↺
        </button>
      </div>
    </div>
  );
}
