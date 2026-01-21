export interface HistorialDescarga {
  id: number;
  fechaLabel: string;      // Hoy, Ayer, 18 de Enero 2026
  delegacion: string;
  mes: string;
  ruta: string;
  archivos: number;
  tamanio: string;
  hace: string;            // Hace 5 minutos, Hace 1 día
  huboErrores: boolean;
}
