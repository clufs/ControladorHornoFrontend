import type { LecturaHorno } from "../types/horno";

interface InfoCardProps {
  lectura: LecturaHorno | null;
}

export function InfoCard({ lectura }: InfoCardProps) {
  return (
    <div className="card info-card">
      <h2 className="info-card__title">Información</h2>
      <div className="info-card__grid">
        <div className="info-card__item">
          <span className="info-card__label">T1</span>
          <span className="info-card__value">
            {lectura ? `${lectura.temp_c}°C` : "---"}
          </span>
        </div>
        <div className="info-card__item">
          <span className="info-card__label">T2</span>
          <span className="info-card__value">
            {lectura && lectura.temp2_c !== undefined ? `${lectura.temp2_c}°C` : "---"}
          </span>
        </div>
        <div className="info-card__item">
          <span className="info-card__label">Temp. Máxima</span>
          <span className="info-card__value">
            {lectura ? `${lectura.temp_max}°C` : "---"}
          </span>
        </div>
        <div className="info-card__item">
          <span className="info-card__label">Tasa</span>
          <span className="info-card__value">
            {lectura ? `${lectura.tasa_c_min.toFixed(1)}°C/min` : "---"}
          </span>
        </div>
        <div className="info-card__item">
          <span className="info-card__label">Soak</span>
          <span className="info-card__value">
            {lectura !== null ? (lectura.soak_activo ? "Activo" : "Inactivo") : "---"}
          </span>
        </div>
        <div className="info-card__item">
          <span className="info-card__label">Alertas</span>
          <span className="info-card__value">
            {lectura !== null ? (lectura.alert_flags ? "⚠ Activa" : "Normal") : "---"}
          </span>
        </div>
      </div>
    </div>
  );
}
