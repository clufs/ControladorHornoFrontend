import { useState, useEffect, useMemo } from "react";
import { fetchHistorial, type HistorialPoint } from "../services/api";

export interface RatePoint extends HistorialPoint {
  tasa: number | null;
}

const WINDOW_OPTIONS = [
  { label: "30 s", value: 0.5 },
  { label: "1 min", value: 1 },
  { label: "2 min", value: 2 },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
] as const;

export type WindowOption = (typeof WINDOW_OPTIONS)[number]["value"];

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    desde: start.toISOString(),
    hasta: now.toISOString(),
  };
}

const REFRESH_INTERVAL_MS = 30_000;

export function useHistorial(hornoId = 1) {
  const [data, setData] = useState<HistorialPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowMin, setWindowMin] = useState<WindowOption>(5);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval>;

    async function load(showLoading: boolean) {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const { desde, hasta } = getTodayRange();
        const result = await fetchHistorial(hornoId, desde, hasta);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (showLoading && !cancelled) setLoading(false);
      }
    }

    load(true);
    intervalId = setInterval(() => load(false), REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [hornoId]);

  const dataWithRate = useMemo(() => {
    if (data.length < 2) return { points: data as RatePoint[], currentRate: null };

    const windowMs = windowMin * 60 * 1000;

    const points: RatePoint[] = data.map((point, i) => {
      const pointTime = new Date(point.timestamp).getTime();
      const cutoff = pointTime - windowMs;

      let j = i - 1;
      while (j >= 0 && new Date(data[j].timestamp).getTime() > cutoff) {
        j--;
      }

      if (j < 0) {
        return { ...point, tasa: null };
      }

      const dtMin = (pointTime - new Date(data[j].timestamp).getTime()) / 60000;
      const dTemp = point.temperatura - data[j].temperatura;
      const tasa = dtMin > 0 ? dTemp / dtMin : 0;

      return { ...point, tasa: Math.round(tasa * 10) / 10 };
    });

    const last = points[points.length - 1];
    const currentRate = last.tasa ?? null;

    return { points, currentRate };
  }, [data, windowMin]);

  return {
    historial: dataWithRate.points,
    currentRate: dataWithRate.currentRate,
    loading,
    error,
    windowMin,
    setWindowMin,
    windowOptions: WINDOW_OPTIONS,
  };
}
