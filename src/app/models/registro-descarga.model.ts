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
