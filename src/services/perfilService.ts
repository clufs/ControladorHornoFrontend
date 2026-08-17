const API_BASE = "/api";

export interface PerfilFuego {
  id: number;
  hornoId: number;
  nombre: string;
  descripcion?: string;
  segmentos: { target: number; rate: number; hold: number }[];
  notas?: string;
  material?: string;
  tempMaxima?: number;
  duracionEstimada?: number;
  favorito: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listarPerfiles(hornoId: number): Promise<PerfilFuego[]> {
  const res = await fetch(`${API_BASE}/hornos/perfiles/${hornoId}`);
  if (!res.ok) throw new Error("Error al listar perfiles");
  return res.json();
}

export async function obtenerPerfil(id: number): Promise<PerfilFuego> {
  const res = await fetch(`${API_BASE}/hornos/perfil/${id}`);
  if (!res.ok) throw new Error("Error al obtener perfil");
  return res.json();
}

export async function crearPerfil(data: {
  hornoId: number;
  nombre: string;
  descripcion?: string;
  segmentos: { target: number; rate: number; hold: number }[];
  notas?: string;
  material?: string;
  tempMaxima?: number;
  duracionEstimada?: number;
}): Promise<PerfilFuego> {
  const res = await fetch(`${API_BASE}/hornos/perfiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear perfil");
  return res.json();
}

export async function actualizarPerfil(
  id: number,
  data: Partial<{
    nombre: string;
    descripcion: string;
    segmentos: { target: number; rate: number; hold: number }[];
    notas: string;
    material: string;
    tempMaxima: number;
    duracionEstimada: number;
    favorito: boolean;
  }>
): Promise<PerfilFuego> {
  const res = await fetch(`${API_BASE}/hornos/perfil/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar perfil");
  return res.json();
}

export async function eliminarPerfil(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/hornos/perfil/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar perfil");
}
