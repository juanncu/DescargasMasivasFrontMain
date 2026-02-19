export interface HistorialDescarga {
  id: number;
  fechaLabel: string;
  delegacion: string;
  archivos: number;
  mesInicio: string;
  mesFinal: string;
  anio: number;
  formatos: string[];
  padron: string;
  estadoFiltro: string;
  rutaRed: string;
  tamanio: string;
  estado: 'completado' | 'pendiente' | 'error';
  huboErrores: boolean;
  totalPdf: number;
  totalXml: number;
  totalRecibos: number;
  omitidos: number;
  fechaReal: Date; // Agregado para soportar ordenamiento
  hace: string;    // Agregado para el diseño de tarjetas
}