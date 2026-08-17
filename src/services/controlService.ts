import { socket } from "./socket";
import type { Segmento } from "../types/horno";

export function iniciarPerfil(segmentos: Segmento[]) {
  socket.emit("iniciarPerfil", { segmentos });
}

export function detenerPerfil() {
  socket.emit("detenerPerfil");
}

export function emergencia() {
  socket.emit("emergencia");
}
