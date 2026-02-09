
export interface HistorialDescarga {
  id: number;
  fechaLabel: string;
  delegacion: string;
  archivos: number;
 mesInicio: string;  // Antes era solo 'mes'
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
}
