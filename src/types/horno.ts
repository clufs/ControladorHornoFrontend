export interface LecturaHorno {
  temp_c: number;
  temp2_c?: number;
  tasa_c_min: number;
  fase_actual: string;
  alert_flags: number;
  soak_activo: boolean;
  temp_max: number;
  tiempo_s: number;
}

export interface HistoryEntry {
  id: string;
  temp: number;
  temp2?: number;
  time: number;
  formattedTime: string;
  fase_actual?: string;
  alert_flags?: number;
  soak_activo?: boolean;
  temp_max?: number;
  tasa_c_min?: number;
  tiempo_s?: number;
}

export interface Segmento {
  target: number;
  rate: number;
  hold: number;
}

export interface ControlStatus {
  ssr: boolean;
  setpoint: number;
  objetivo: number;
  segmento: number;
  totalSegmentos: number;
  activo: boolean;
  enMantencion: boolean;
}
