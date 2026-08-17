import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_MIN = 30;

export function usePhaseTimer(faseActual: string | undefined) {
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [durationMin, setDurationMin] = useState(DEFAULT_MIN);
  const prevFaseRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prev = prevFaseRef.current;
    prevFaseRef.current = faseActual;

    if (faseActual === "cuarzo" && prev !== "cuarzo") {
      setRemainingSec(durationMin * 60);
      setIsRunning(true);
    } else if (prev === "cuarzo" && faseActual !== "cuarzo") {
      setRemainingSec(null);
      setIsRunning(false);
    }
  }, [faseActual, durationMin]);

  useEffect(() => {
    if (!isRunning || remainingSec === null || remainingSec <= 0) return;

    const id = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev === null || prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, remainingSec]);

  const reset = useCallback(() => {
    setRemainingSec(null);
    setIsRunning(false);
  }, []);

  return { remainingSec, isRunning, durationMin, setDurationMin, reset };
}
