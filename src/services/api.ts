const API_BASE = "/api";

export interface HistorialPoint {
  temperatura: number;
  minutosDesdeInicio: number;
  timestamp: string;
}

export async function fetchHistorial(
  hornoId: number,
  desde?: string,
  hasta?: string,
): Promise<HistorialPoint[]> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const res = await fetch(`${API_BASE}/hornos/historial/${hornoId}?${params}`);
  if (!res.ok) throw new Error("Error al obtener historial");
  return res.json();
}
