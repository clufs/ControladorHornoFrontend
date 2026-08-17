import { useState } from "react";
import { iniciarPerfil } from "../services/controlService";
import type { Segmento } from "../types/horno";

export function PerfilEditor() {
  const [segmentos, setSegmentos] = useState<Segmento[]>([
    { target: 100, rate: 2, hold: 0 },
  ]);
  const [enviando, setEnviando] = useState(false);

  function actualizarSeg(idx: number, campo: keyof Segmento, valor: number) {
    setSegmentos((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s))
    );
  }

  function agregarSegmento() {
    if (segmentos.length >= 15) return;
    const ultimo = segmentos[segmentos.length - 1];
    setSegmentos([...segmentos, { target: ultimo.target + 100, rate: 2, hold: 0 }]);
  }

  function eliminarSegmento(idx: number) {
    if (segmentos.length <= 1) return;
    setSegmentos(segmentos.filter((_, i) => i !== idx));
  }

  function enviar() {
    setEnviando(true);
    iniciarPerfil(segmentos);
    setTimeout(() => setEnviando(false), 1000);
  }

  return (
    <div className="card perfil-editor">
      <h2 className="perfil-editor__title">Perfil de Coccion</h2>

      <div className="perfil-editor__headers">
        <span className="perfil-editor__header">#</span>
        <span className="perfil-editor__header">Objetivo</span>
        <span className="perfil-editor__header">Rate</span>
        <span className="perfil-editor__header">Mant.</span>
        <span className="perfil-editor__header"></span>
      </div>

      {segmentos.map((seg, idx) => (
        <div key={idx} className="perfil-editor__row">
          <span className="perfil-editor__num">{idx + 1}</span>
          <div className="perfil-editor__field">
            <input
              type="number"
              value={seg.target}
              onChange={(e) => actualizarSeg(idx, "target", Number(e.target.value))}
              className="perfil-editor__input"
              min={0}
              max={1350}
            />
            <span className="perfil-editor__unit">°C</span>
          </div>
          <div className="perfil-editor__field">
            <input
              type="number"
              value={seg.rate}
              onChange={(e) => actualizarSeg(idx, "rate", Number(e.target.value))}
              className="perfil-editor__input"
              min={0.1}
              max={50}
              step={0.5}
            />
            <span className="perfil-editor__unit">°/m</span>
          </div>
          <div className="perfil-editor__field">
            <input
              type="number"
              value={seg.hold}
              onChange={(e) => actualizarSeg(idx, "hold", Number(e.target.value))}
              className="perfil-editor__input"
              min={0}
              max={999}
            />
            <span className="perfil-editor__unit">min</span>
          </div>
          <button
            className="perfil-editor__btn-remove"
            onClick={() => eliminarSegmento(idx)}
            disabled={segmentos.length <= 1}
            title="Eliminar etapa"
          >
            ×
          </button>
        </div>
      ))}

      <div className="perfil-editor__actions">
        <button
          className="perfil-editor__btn-add"
          onClick={agregarSegmento}
          disabled={segmentos.length >= 15}
        >
          + Agregar etapa
        </button>
        <button
          className="perfil-editor__btn-send"
          onClick={enviar}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar Perfil"}
        </button>
      </div>
    </div>
  );
}
