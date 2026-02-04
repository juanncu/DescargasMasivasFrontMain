import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistorialDescarga } from '../../models/historial.descarga.model';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-historial-descargas',
  standalone: true,
  imports: [
    RouterLink, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule
  ],
  providers: [DatePipe],
  templateUrl: './historial-descargas.html',
  styleUrls: ['./historial-descargas.css']
})
export class HistorialDescargas implements OnInit {

  historial: HistorialDescarga[] = [];
  detalle!: HistorialDescarga; // Propuesto por Katia para la vista de detalle

  // Inyecciones mediante inject (más moderno)
  private apiService = inject(ApiService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  cargarDatosReales() {
    this.apiService.getHistorialDescargas().subscribe({
      next: (datosApi) => {
        console.log("Datos recibidos de API:", datosApi);

        // Transformación de datos: Unimos tu lógica con los campos de Katia
        this.historial = datosApi.map((item: any) => {
          const fecha = item.fecheCreacionRegistro ? new Date(item.fecheCreacionRegistro) : new Date();
          const totalArchivos = item.total || 0;

          return {
            id: item.id,
            fechaReal: fecha,
            fechaLabel: this.formatearFechaAmigable(fecha),
            delegacion: item.delegacion || `Referencia: ${item.idDescarga}`, 
            archivos: totalArchivos,
            // Campos extendidos de KatiaNue (se mapean si vienen de la API o se inicializan)
            mes: item.mes || 'Periodo pendiente',
            anio: item.anio || fecha.getFullYear(),
            totalPdf: item.totalPdf || 0,
            totalXml: item.totalXml || 0,
            totalRecibos: item.totalRecibos || 0,
            omitidos: item.omitidos || 0,
            formatos: item.formatos || 'N/A',
            padron: item.padron || 'No especificado',
            estadoFiltro: item.estadoFiltro || 'N/A',
            rutaRed: item.rutaRed || `C:\\Descargas\\${item.idDescarga}\\Resultados`,
            tamanio: item.tamanio || this.calcularPesoEstimado(totalArchivos),
            estado: item.estado || (totalArchivos > 0 ? 'completado' : 'pendiente'),
            huboErrores: item.huboErrores ?? (totalArchivos === 0),
            hace: this.calcularHaceTiempo(fecha)
          };
        });

        // Ordenamiento por fecha descendente
        this.historial.sort((a, b) => {
          const tiempoA = a.fechaReal?.getTime() || 0;
          const tiempoB = b.fechaReal?.getTime() || 0;
          return tiempoB - tiempoA;
        });

        this.cd.detectChanges(); 
      },
      error: (err) => console.error('Error cargando historial:', err)
    });
  }

  // --- Funciones de Lógica y Formato ---

  calcularPesoEstimado(archivos: number): string {
    if (!archivos) return '0 KB';
    const pesoKB = archivos * 200; 
    if (pesoKB > 1024 * 1024) return (pesoKB / (1024 * 1024)).toFixed(2) + ' GB';
    if (pesoKB > 1024) return (pesoKB / 1024).toFixed(1) + ' MB';
    return pesoKB + ' KB';
  }

  formatearFechaAmigable(fecha: Date): string {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    if (this.esMismaFecha(fecha, hoy)) return 'Hoy';
    if (this.esMismaFecha(fecha, ayer)) return 'Ayer';
    return this.datePipe.transform(fecha, 'dd MMMM yyyy') || '';
  }

  esMismaFecha(f1: Date, f2: Date): boolean {
    return f1.getDate() === f2.getDate() &&
           f1.getMonth() === f2.getMonth() &&
           f1.getFullYear() === f2.getFullYear();
  }

  calcularHaceTiempo(fecha: Date): string {
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHrs / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHrs < 24) return `Hace ${diffHrs} horas`;
    return `Hace ${diffDays} días`;
  }

  // Se mejora la función para guardar el detalle antes de navegar, como pide Katia
  verDetalle(descarga: HistorialDescarga) {
    this.detalle = descarga;
    console.log('Navegando al detalle de:', descarga.id);
    this.router.navigate(['/historial-descargas', descarga.id]);
  }
}