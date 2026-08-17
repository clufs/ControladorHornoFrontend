import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
} from "recharts";
import type { RatePoint, WindowOption } from "../hooks/useHistorial";

const CHART_MARGIN = { top: 10, right: 20, left: 50, bottom: 5 };

interface HistorialViewProps {
  data: RatePoint[];
  currentRate: number | null;
  loading: boolean;
  error: string | null;
  windowMin: WindowOption;
  windowOptions: readonly { label: string; value: number }[];
  onWindowChange: (value: WindowOption) => void;
}

export function HistorialView({
  data,
  currentRate,
  loading,
  error,
  windowMin,
  windowOptions,
  onWindowChange,
}: HistorialViewProps) {
  const [selStartMin, setSelStartMin] = useState<number | null>(null);
  const [selEndMin, setSelEndMin] = useState<number | null>(null);
  const [selPhase, setSelPhase] = useState<"start" | "end" | "done">("start");
  const hoverIndexRef = useRef<number | null>(null);
  const mouseIndexRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelStartMin(null);
    setSelEndMin(null);
    setSelPhase("start");
  }, [data]);

  const getIndexFromClientX = useCallback((clientX: number): number | null => {
    const el = wrapperRef.current;
    if (!el || data.length === 0) return null;
    const rect = el.getBoundingClientRect();
    const relX = clientX - rect.left - CHART_MARGIN.left;
    const plotWidth = rect.width - CHART_MARGIN.left - CHART_MARGIN.right;
    if (plotWidth <= 0) return null;
    const ratio = Math.max(0, Math.min(1, relX / plotWidth));
    return Math.round(ratio * (data.length - 1));
  }, [data]);

  const handleWrapperMove = useCallback((e: React.MouseEvent) => {
    mouseIndexRef.current = getIndexFromClientX(e.clientX);
  }, [getIndexFromClientX]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const i = hoverIndexRef.current ?? mouseIndexRef.current ?? getIndexFromClientX(e.clientX);
    if (i === null || i < 0 || i >= data.length) return;

    const clickedMin = data[i].minutosDesdeInicio;

    if (selPhase === "start") {
      setSelStartMin(clickedMin);
      setSelEndMin(null);
      setSelPhase("end");
    } else if (selPhase === "end") {
      if (Math.abs(clickedMin - (selStartMin ?? -Infinity)) > 0.01) {
        setSelEndMin(clickedMin);
        setSelPhase("done");
      }
    } else {
      setSelStartMin(clickedMin);
      setSelEndMin(null);
      setSelPhase("end");
    }
  }, [selPhase, selStartMin, data, getIndexFromClientX]);

  const selData = useMemo(() => {
    if (selStartMin === null || selEndMin === null) return null;
    const a = Math.min(selStartMin, selEndMin);
    const b = Math.max(selStartMin, selEndMin);
    if (Math.abs(b - a) < 0.01) return null;

    const startIdx = data.findIndex((p) => p.minutosDesdeInicio === a);
    const endIdx = b === a ? startIdx : data.findIndex((p) => p.minutosDesdeInicio === b);

    if (startIdx === -1 || endIdx === -1) return null;

    const first = data[startIdx];
    const last = data[endIdx];

    const dMin = last.minutosDesdeInicio - first.minutosDesdeInicio;
    const dTemp = last.temperatura - first.temperatura;

    if (dMin <= 0) return null;

    const rate = Math.round((dTemp / dMin) * 10) / 10;
    return {
      startMin: first.minutosDesdeInicio,
      endMin: last.minutosDesdeInicio,
      startTemp: first.temperatura,
      endTemp: last.temperatura,
      dMin,
      dTemp,
      rate,
    };
  }, [selStartMin, selEndMin, data]);

  return (
    <div className="card historial-card">
      <h2 className="historial-card__title">
        Historial de hoy
        {selPhase === "end" && selStartMin !== null && (
          <span className="historial-card__hint"> — Seleccioná el punto final</span>
        )}
      </h2>

      {loading && <p className="historial-card__status">Cargando...</p>}
      {error && <p className="historial-card__status historial-card__status--error">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <>
          <div
            ref={wrapperRef}
            onMouseMove={handleWrapperMove}
            onMouseDown={handleMouseDown}
            style={{ cursor: "crosshair", userSelect: "none" }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={data}
                margin={CHART_MARGIN}
                onMouseMove={(state) => {
                  const i = state?.activeTooltipIndex;
                  if (typeof i === "number" && i >= 0) hoverIndexRef.current = i;
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                <XAxis
                  dataKey="minutosDesdeInicio"
                  stroke="#8b949e"
                  tick={{ fill: "#8b949e", fontSize: 11 }}
                  tickLine={false}
                  label={{ value: "min", position: "insideBottomRight", offset: -5, fill: "#8b949e", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="temp"
                  stroke="#58a6ff"
                  tick={{ fill: "#58a6ff", fontSize: 11 }}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  yAxisId="tasa"
                  orientation="right"
                  stroke="#3fb950"
                  tick={{ fill: "#3fb950", fontSize: 11 }}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: 8,
                    color: "#e6edf3",
                  }}
                  labelStyle={{ color: "#8b949e" }}
                  formatter={(value, name) => {
                    if (name === "temperatura") return [`${value}°C`, "T1"];
                    if (name === "temperatura2") return [`${value}°C`, "T2"];
                    return [`${value}°C/min`, "Tasa"];
                  }}
                  labelFormatter={(label) => `${label} min`}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8b949e" }} />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#58a6ff"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#58a6ff" }}
                  name="temperatura"
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperatura2"
                  stroke="#f0883e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#f0883e" }}
                  name="temperatura2"
                />
                <Line
                  yAxisId="tasa"
                  type="monotone"
                  dataKey="tasa"
                  stroke="#3fb950"
                  strokeWidth={1.5}
                  dot={false}
                  name="Tasa"
                  connectNulls={false}
                />
                {selStartMin !== null && selEndMin !== null && (
                  <ReferenceArea
                    yAxisId="temp"
                    x1={Math.min(selStartMin, selEndMin)}
                    x2={Math.max(selStartMin, selEndMin)}
                    stroke="#f0883e"
                    strokeOpacity={0.6}
                    fill="#f0883e"
                    fillOpacity={0.1}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="historial-card__controls">
            <div className="historial-card__control">
              <label className="historial-card__control-label">Ventana para tasa móvil:</label>
              <select
                className="historial-card__select"
                value={windowMin}
                onChange={(e) => onWindowChange(Number(e.target.value) as WindowOption)}
              >
                {windowOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="historial-card__rate">
              <span className="historial-card__rate-label">Tasa actual:</span>
              <span
                className="historial-card__rate-value"
                style={currentRate !== null && currentRate < 0 ? { color: "#f85149" } : undefined}
              >
                {currentRate !== null ? `${currentRate > 0 ? "+" : ""}${currentRate}°C/min` : "---"}
              </span>
            </div>
          </div>

          {selData && (
            <div className="historial-card__sel">
              <div className="historial-card__sel-title">Segmento seleccionado</div>
              <div className="historial-card__sel-detail">
                {selData.startMin} min → {selData.endMin} min
                <span className="historial-card__sel-dot" />
                {"\u0394T"} = {selData.dTemp > 0 ? "+" : ""}{selData.dTemp}°C
                <span className="historial-card__sel-dot" />
                {"\u0394t"} = {selData.dMin} min
              </div>
              <div className="historial-card__sel-rate">
                {selData.rate > 0 ? "+" : ""}{selData.rate} °C/min
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="historial-card__status">Sin datos para hoy</p>
      )}
    </div>
  );
}
