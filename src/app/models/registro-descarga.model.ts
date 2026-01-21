export interface RegistroDescarga {
  estado: 'OK' | 'ERROR';
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
  padron: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  delegacion: number | null;
  estado: number | null;
}
