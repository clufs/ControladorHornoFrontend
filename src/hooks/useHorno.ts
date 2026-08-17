import { useState, useEffect, useCallback, useRef } from "react";
import { socket } from "../services/socket";
import type { LecturaHorno, HistoryEntry, ControlStatus } from "../types/horno";

const MAX_HISTORY = 300;

export type Trend = "up" | "down" | "stable";

function formatTime(): string {
  return new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function calcTrend(prev: number | null, curr: number | null): Trend {
  if (prev === null || curr === null) return "stable";
  const diff = curr - prev;
  if (diff > 0.5) return "up";
  if (diff < -0.5) return "down";
  return "stable";
}

let counter = 0;

const DEFAULT_CONTROL: ControlStatus = {
  ssr: false,
  setpoint: 0,
  objetivo: 0,
  segmento: 0,
  totalSegmentos: 0,
  activo: false,
  enMantencion: false,
};

const ESP_TIMEOUT_MS = 10000;

export function useHorno() {
  const [currentLectura, setCurrentLectura] = useState<LecturaHorno | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isEspConnected, setIsEspConnected] = useState(false);
  const [trend, setTrend] = useState<Trend>("stable");
  const [controlStatus, setControlStatus] = useState<ControlStatus>(DEFAULT_CONTROL);
  const historyRef = useRef<HistoryEntry[]>([]);
  const prevTempRef = useRef<number | null>(null);
  const espTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetEspTimer = useCallback(() => {
    setIsEspConnected(true);
    if (espTimerRef.current) clearTimeout(espTimerRef.current);
    espTimerRef.current = setTimeout(() => setIsEspConnected(false), ESP_TIMEOUT_MS);
  }, []);

  const handleLectura = useCallback((data: LecturaHorno) => {
    resetEspTimer();

    const entry: HistoryEntry = {
      id: String(++counter),
      temp: data.temp_c,
      time: Math.floor(Date.now() / 1000),
      formattedTime: formatTime(),
      fase_actual: data.fase_actual,
      alert_flags: data.alert_flags,
      soak_activo: data.soak_activo,
      temp_max: data.temp_max,
      tasa_c_min: data.tasa_c_min,
      tiempo_s: data.tiempo_s,
    };

    const prevTemp = prevTempRef.current;
    prevTempRef.current = data.temp_c;
    setTrend(calcTrend(prevTemp, data.temp_c));

    setCurrentLectura(data);
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), entry];
    setHistory(historyRef.current);
  }, [resetEspTimer]);

  const handleStatus = useCallback((data: ControlStatus) => {
    setControlStatus(data);
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("lectura", handleLectura);
    socket.on("status", handleStatus);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("lectura", handleLectura);
      socket.off("status", handleStatus);
      socket.disconnect();
      if (espTimerRef.current) clearTimeout(espTimerRef.current);
    };
  }, [handleLectura, handleStatus]);

  const currentTemp = currentLectura?.temp_c ?? null;

  return { currentLectura, currentTemp, history, isConnected, isEspConnected, trend, controlStatus };
}
