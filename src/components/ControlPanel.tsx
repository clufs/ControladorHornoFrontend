import { detenerPerfil, emergencia } from "../services/controlService";
import type { ControlStatus } from "../types/horno";

interface Props {
  status: ControlStatus;
}

export function ControlPanel({ status }: Props) {
  return (
    <div className="card control-panel">
      <h2 className="control-panel__title">Control</h2>

      <div className="control-panel__status">
        <div className="control-panel__ssr">
          <span className="control-panel__label">SSR</span>
          <span className={`control-panel__dot ${status.ssr ? "control-panel__dot--on" : ""}`} />
          <span className={`control-panel__ssr-text ${status.ssr ? "control-panel__ssr-text--on" : ""}`}>
            {status.ssr ? "ON" : "OFF"}
          </span>
        </div>

        <div className="control-panel__info">
          <div className="control-panel__info-item">
            <span className="control-panel__label">Setpoint</span>
            <span className="control-panel__value">{status.setpoint}°C</span>
          </div>
          <div className="control-panel__info-item">
            <span className="control-panel__label">Segmento</span>
            <span className="control-panel__value">
              {status.activo ? `${status.segmento}/${status.totalSegmentos}` : "-"}
            </span>
          </div>
          <div className="control-panel__info-item">
            <span className="control-panel__label">Estado</span>
            <span className="control-panel__value">
              {!status.activo
                ? "Inactivo"
                : status.enMantencion
                ? "Manteniendo"
                : "Rampando"}
            </span>
          </div>
        </div>
      </div>

      <div className="control-panel__buttons">
        <button
          className="control-panel__btn control-panel__btn--stop"
          onClick={detenerPerfil}
          disabled={!status.activo}
        >
          Detener
        </button>
        <button
          className="control-panel__btn control-panel__btn--emergency"
          onClick={() => {
            if (window.confirm("¿Activar emergencia? Se apagara el SSR inmediatamente.")) {
              emergencia();
            }
          }}
        >
          Emergencia
        </button>
      </div>
    </div>
  );
}
