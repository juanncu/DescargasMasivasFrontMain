// En tu archivo de modelos o donde esté HistorialDescarga
export interface HistorialDescarga {
  id: number;
  fechaReal: Date;
  fechaLabel: string;
  delegacion: string;
  archivos: number;
  mes: string;
  anio: number;          
  formatos: string;    
  padron: string;       
  estadoFiltro: string;  
  rutaRed: string;
  tamanio: string;
  estado: string;
  huboErrores: boolean;
  totalPdf: number;    
  totalXml: number;     
  totalRecibos: number;
  omitidos: number;
}
