import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'; // Importamos Router
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';
import { SelectDescarga } from '../../services/select-descarga';
import { WebSocketService } from '../../services/websocket'; 

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-descarga.html',
  styleUrls: ['./progreso-descarga.css'],
})
export class ProgresoDescargaComponent implements OnInit, OnDestroy {
  // Variables de estado
  progreso = 0;
  registros: RegistroDescarga[] = [];
  tiempoEstimado = 'Calculando...';
  mostrarPopup = false;
  urlDescarga = '';

  constructor(
    private descargaService: DescargaFoliosService,
    private selectDescarga: SelectDescarga,
    private wsService: WebSocketService, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Nos suscribimos a los cambios en el servicio de selección
    // NOTA: Si tu servicio usa 'filtros$' en lugar de 'delegacion$', ajusta esta línea.
    // Aquí asumo que obtienes la delegación ya sea directa o desde los filtros.
    this.selectDescarga.filtros$.subscribe((filtros: any) => {
      
      // Verificamos si hay delegación (puede venir dentro de filtros o directo)
      const delegacionId = filtros.delegacion ? Number(filtros.delegacion) : null;

      if (delegacionId) {
        
        // 1. Conectamos el WebSocket
        this.wsService.conectar(delegacionId);

        // 2. Escuchamos los mensajes del WebSocket
        this.wsService.mensajes$.subscribe({
          next: (data: any) => {
            // Actualizamos progreso
            this.progreso = data.porcentaje;

            // Agregamos registro si es una factura
            if (data.factura) {
              this.registros.unshift({ 
                estado: 'OK',
                mensaje: `[${data.actual}/${data.total}] Procesando factura: ${data.factura}`
              });
            }

            // Calculamos tiempo
            this.tiempoEstimado = this.calcularTiempo(data.actual, data.total);

            // Verificamos si terminó
            if (this.progreso >= 100) {
              this.finalizarDescarga();
            }

            // Forzamos actualización de la vista
            this.cdr.detectChanges();
          },
          error: (err: any) => console.error('Error WS:', err)
        });

        // Registro inicial
        this.registros.push({
          estado: 'OK',
          mensaje: `Iniciando descarga para delegación ${delegacionId}...`,
        });

        // 3. Iniciamos el proceso en el Backend (HTTP)
        this.descargaService.iniciarDescarga(delegacionId).subscribe({
            error: (e: any) => {
                console.error("Error al iniciar proceso:", e);
                this.registros.push({ estado: 'ERROR', mensaje: 'No se pudo iniciar el proceso.' });
            }
        });
      }
    });
  }

  // --- MÉTODOS AUXILIARES (Ahora sí están dentro de la clase) ---

  calcularTiempo(actual: number, total: number): string {
    if (actual === 0) return 'Calculando...';
    const pendientes = total - actual;
    return `${pendientes} archivos pendientes`;
  }

  finalizarDescarga() {
    this.registros.unshift({ estado: 'OK', mensaje: '¡Descarga Completa!' });
    // Ajusta la IP si es necesario
    this.urlDescarga = 'http://172.20.23.41:8000/descargas/resultado.zip'; 
    this.mostrarPopup = true;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
    this.wsService.cerrar();
    this.router.navigate(['/']); 
  }

  descargaArchivo() {
    window.open(this.urlDescarga, '_blank');
    // Mantenemos el popup abierto para que el usuario vea que terminó
  }

  ngOnDestroy() {
    this.wsService.cerrar();
  }
}