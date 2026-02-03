export interface RegistroDescarga {
  estado: 'OK' | 'ERROR' | 'INFO';
  mensaje: string;
  archivo?: string;
}

export interface ArchivoDescarga {
  nombre: string;
  estado: 'OK' | 'ERROR';
  mensaje?: string;
}

export interface RegistroFolio {
  folio: string;
  archivos: ArchivoDescarga[];
}

export interface FiltrosCFDI {
  fechaInicio: string | null;
  fechaFin: string | null;
  delegacion: number | null;
  estado: number | null;
  anio: number;          // <--- Agregar este
  padron: number | null;        // <--- Agregar este
  estadoFiltro: string;  // <--- Agregar este
  formatos: string;
}
