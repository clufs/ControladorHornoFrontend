import { useState, useEffect, useCallback } from "react";
import { iniciarPerfil } from "../services/controlService";
import {
  listarPerfiles,
  crearPerfil,
  eliminarPerfil,
  actualizarPerfil,
} from "../services/perfilService";
import type { Segmento } from "../types/horno";
import type { PerfilFuego } from "../services/perfilService";

const HORNO_ID = 1;

export function PerfilEditor() {
  const [segmentos, setSegmentos] = useState<Segmento[]>([
    { target: 100, rate: 2, hold: 0 },
  ]);
  const [nombre, setNombre] = useState("");
  const [notas, setNotas] = useState("");
  const [material, setMaterial] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [perfiles, setPerfiles] = useState<PerfilFuego[]>([]);
  const [perfilActivoId, setPerfilActivoId] = useState<number | null>(null);
  const [cargandoPerfiles, setCargandoPerfiles] = useState(true);
  const [mostrarLista, setMostrarLista] = useState(false);

  const cargarPerfiles = useCallback(async () => {
    try {
      setCargandoPerfiles(true);
      const lista = await listarPerfiles(HORNO_ID);
      setPerfiles(lista);
    } catch (e) {
      console.error("Error cargando perfiles:", e);
    } finally {
      setCargandoPerfiles(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfiles();
  }, [cargarPerfiles]);

  function cargarPerfil(perfil: PerfilFuego) {
    setSegmentos(perfil.segmentos.length > 0 ? [...perfil.segmentos] : [{ target: 100, rate: 2, hold: 0 }]);
    setNombre(perfil.nombre);
    setNotas(perfil.notas ?? "");
    setMaterial(perfil.material ?? "");
    setPerfilActivoId(perfil.id);
    setMostrarLista(false);
  }

  function nuevaReceta() {
    setSegmentos([{ target: 100, rate: 2, hold: 0 }]);
    setNombre("");
    setNotas("");
    setMaterial("");
    setPerfilActivoId(null);
  }

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

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      const tempMax = Math.max(...segmentos.map((s) => s.target));
      const duracion = segmentos.reduce((acc, s, i) => {
        const prevTarget = i > 0 ? segmentos[i - 1].target : 0;
        const delta = Math.abs(s.target - prevTarget);
        return acc + (s.rate > 0 ? delta / s.rate : 0) + s.hold;
      }, 0);

      const data = {
        hornoId: HORNO_ID,
        nombre: nombre.trim(),
        segmentos,
        notas: notas.trim() || undefined,
        material: material.trim() || undefined,
        tempMaxima: tempMax,
        duracionEstimada: Math.round(duracion),
      };

      if (perfilActivoId) {
        await actualizarPerfil(perfilActivoId, data);
      } else {
        const creado = await crearPerfil(data);
        setPerfilActivoId(creado.id);
      }
      await cargarPerfiles();
    } catch (e) {
      console.error("Error guardando perfil:", e);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar este perfil?")) return;
    try {
      await eliminarPerfil(id);
      if (perfilActivoId === id) nuevaReceta();
      await cargarPerfiles();
    } catch (e) {
      console.error("Error eliminando perfil:", e);
    }
  }

  const duracionTotal = segmentos.reduce((acc, s, i) => {
    const prevTarget = i > 0 ? segmentos[i - 1].target : 0;
    const delta = Math.abs(s.target - prevTarget);
    const rampa = s.rate > 0 ? (delta / s.rate) : 0;
    return acc + rampa + s.hold;
  }, 0);

  return (
    <div className="card perfil-editor">
      <div className="perfil-editor__header-row">
        <h2 className="perfil-editor__title">
          {perfilActivoId ? "Editando: " + nombre : "Nuevo Perfil"}
        </h2>
        <div className="perfil-editor__header-btns">
          <button
            className="perfil-editor__btn-icon"
            onClick={() => setMostrarLista(!mostrarLista)}
            title="Perfiles guardados"
          >
            {mostrarLista ? "▲" : "▼"} ({perfiles.length})
          </button>
          <button
            className="perfil-editor__btn-icon"
            onClick={nuevaReceta}
            title="Nueva receta"
          >
            +
          </button>
        </div>
      </div>

      {mostrarLista && (
        <div className="perfil-editor__lista">
          {cargandoPerfiles && <p className="perfil-editor__empty">Cargando...</p>}
          {!cargandoPerfiles && perfiles.length === 0 && (
            <p className="perfil-editor__empty">Sin perfiles guardados</p>
          )}
          {perfiles.map((p) => (
            <div key={p.id} className="perfil-editor__perfil-item">
              <div className="perfil-editor__perfil-info" onClick={() => cargarPerfil(p)}>
                <span className="perfil-editor__perfil-nombre">{p.nombre}</span>
                <span className="perfil-editor__perfil-meta">
                  {p.segmentos.length} etapas · {p.tempMaxima ?? "?"}°C
                  {p.material ? ` · ${p.material}` : ""}
                </span>
              </div>
              <button
                className="perfil-editor__btn-delete"
                onClick={() => eliminar(p.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="perfil-editor__fields">
        <input
          type="text"
          placeholder="Nombre del perfil (ej: Bizcocho 1200°C)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="perfil-editor__text-input"
        />
        <input
          type="text"
          placeholder="Material (ej: Porcelana, Loza, Gres)"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="perfil-editor__text-input"
        />
        <textarea
          placeholder="Notas (ej: Coccion lenta, viento fuerte en etapa 3...)"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="perfil-editor__textarea"
          rows={2}
        />
      </div>

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

      <div className="perfil-editor__duracion">
        Duracion estimada: ~{Math.round(duracionTotal)} min
      </div>

      <div className="perfil-editor__actions">
        <button
          className="perfil-editor__btn-add"
          onClick={agregarSegmento}
          disabled={segmentos.length >= 15}
        >
          + Etapa
        </button>
        <button
          className="perfil-editor__btn-save"
          onClick={guardar}
          disabled={guardando || !nombre.trim()}
        >
          {guardando ? "Guardando..." : perfilActivoId ? "Actualizar" : "Guardar"}
        </button>
        <button
          className="perfil-editor__btn-send"
          onClick={enviar}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
