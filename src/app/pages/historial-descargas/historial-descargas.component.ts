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
    CommonModule, 
    RouterLink, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule
  ],
  providers: [DatePipe],
  templateUrl: './historial-descargas.html',
  styleUrls: ['./historial-descargas.css']
})
export class HistorialDescargas implements OnInit {
  private apiService = inject(ApiService);
  private datePipe = inject(DatePipe);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  historial: HistorialDescarga[] = [];
  cargando = false;

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  cargarDatosReales() {
    this.cargando = true;
    this.apiService.getHistorialDescargas().subscribe({
      next: (datosApi) => {
        this.historial = datosApi.map((item: any): HistorialDescarga => {
          // 1. Manejo robusto de fecha para evitar errores de ordenación
          const fechaRaw = item.fecheCreacionRegistro || item.fechaCreacion || new Date();
          const fechaObj = new Date(fechaRaw);

          return {
            id: Number(item.id) || 0,
            fechaReal: fechaObj, // Campo requerido por la interfaz
            fechaLabel: this.esHoy(fechaObj) ? 'Hoy' : this.datePipe.transform(fechaObj, 'dd/MM/yyyy') || '',
            delegacion: item.delegacion || 'Campeche',
            archivos: Number(item.total) || 0,
            mesInicio: item.mesInicio || this.extraerMes(item.periodo, 'inicio'),
            mesFinal: item.mesFinal || this.extraerMes(item.periodo, 'fin'),
            anio: Number(item.anio || item.Anio) || 2025, // Soporte para error de columna 'Anio'
            formatos: Array.isArray(item.formatos) ? item.formatos : this.mapearFormatos(item),
            padron: item.padron || 'TODOS',
            estadoFiltro: item.estadoFiltro || 'AMBOS',
            rutaRed: item.rutaRed || `C:\\Recibos\\${item.delegacion}`,
            tamanio: item.pesoFormateado || item.tamanio || '0 B',
            estado: (item.estado || 'completado').toLowerCase() as any,
            huboErrores: item.huboErrores ?? false,
            totalPdf: Number(item.totalPdf) || 0,
            totalXml: Number(item.totalXml) || 0,
            totalRecibos: Number(item.totalRecibos) || 0,
            omitidos: Number(item.omitidos) || 0,
            hace: this.calcularHaceTiempo(fechaObj) // Campo requerido por la interfaz
          };
        });

        // Ordenar: lo más reciente primero
        this.historial.sort((a, b) => b.fechaReal.getTime() - a.fechaReal.getTime());
        this.cargando = false;
        this.cd.detectChanges(); // Forzar renderizado
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- Funciones Auxiliares ---

  private esHoy(fecha: Date): boolean {
    return fecha.toDateString() === new Date().toDateString();
  }

  private extraerMes(periodo: string, tipo: 'inicio' | 'fin'): string {
    if (!periodo) return 'N/A';
    const partes = periodo.split('-');
    return tipo === 'inicio' ? partes[0]?.trim() : (partes[1]?.trim() || partes[0]?.trim());
  }

  private mapearFormatos(item: any): string[] {
    const f = [];
    if (item.pdf) f.push('PDF');
    if (item.xml) f.push('XML');
    if (item.recibo) f.push('RECIBOS');
    return f.length > 0 ? f : ['PDF'];
  }

  calcularHaceTiempo(fecha: Date): string {
    const diffMs = new Date().getTime() - fecha.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    if (mins < 60) return `Hace ${mins} min`;
    if (hrs < 24) return `Hace ${hrs} h`;
    return `Hace ${Math.floor(hrs / 24)} d`;
  }

  verDetalle(id: number) {
    this.router.navigate(['/historial-descargas', id]);
  }
}