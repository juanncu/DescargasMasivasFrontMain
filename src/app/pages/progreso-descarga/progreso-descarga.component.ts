import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

// Asegúrate que estas rutas sean correctas en tu proyecto
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';
import { SelectDescarga } from '../../services/select-descarga';
import { WebSocketService } from '../../services/websocket';

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
    // Suscripción a los filtros para obtener la delegación seleccionada
    this.selectDescarga.filtros$.subscribe((filtros: any) => {
      // Ajusta esto según cómo venga tu objeto filtros (filtros.delegacion o directo)
      const delegacionId = filtros?.delegacion ? Number(filtros.delegacion) : null;

      if (delegacionId) {
        this.iniciarProcesoReal(delegacionId);
      } else {
        console.warn('No se recibió un ID de delegación válido.');
        this.registros.push({ estado: 'ERROR', mensaje: 'No hay delegación seleccionada.' });
      }
    });
  }

  // --- LÓGICA REAL (WEBSOCKET + HTTP) ---
  iniciarProcesoReal(delegacionId: number) {
    // 1. Conectar WS (si tu servicio requiere conectar con ID, descomenta abajo)
    // this.wsService.conectar(delegacionId);

    // 2. Escuchar mensajes del WebSocket
    this.wsService.mensajes$.subscribe({
      next: (data: any) => {
        // Actualizamos el porcentaje de la barra
        this.progreso = data.porcentaje;

        // Si llega información de una factura procesada, la agregamos al log
        if (data.factura) {
          this.registros.unshift({
            estado: 'OK',
            mensaje: `[${data.actual}/${data.total}] Procesando factura: ${data.factura}`,
          });
        }

        // Recalcular tiempo estimado
        this.tiempoEstimado = this.calcularTiempo(data.actual, data.total);

        // Si llegamos al 100%, finalizamos
        if (this.progreso >= 100) {
          this.finalizarDescarga();
        }

        // Forzar actualización de la vista por si Angular no detecta el cambio del WS
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error WS:', err);
        this.registros.unshift({ estado: 'ERROR', mensaje: 'Pérdida de conexión con el servidor.' });
      },
    });

    // 3. Iniciar la petición HTTP al Backend para arrancar el proceso
    this.registros.push({
      estado: 'INFO',
      mensaje: `Iniciando descarga para delegación ${delegacionId}...`,
    });

    this.descargaService.iniciarDescarga(delegacionId).subscribe({
      next: (res) => {
        // Opcional: Si el backend responde algo inmediato
        console.log('Proceso iniciado en backend', res);
      },
      error: (e: any) => {
        console.error('Error al iniciar proceso:', e);
        this.registros.push({ estado: 'ERROR', mensaje: 'No se pudo iniciar el proceso en el servidor.' });
      },
    });
  }

  // --- MÉTODOS AUXILIARES ---

  calcularTiempo(actual: number, total: number): string {
    if (!actual || actual === 0) return 'Calculando...';
    const pendientes = total - actual;
    return `${pendientes} archivos pendientes`;
  }

  finalizarDescarga() {
    this.registros.unshift({ estado: 'OK', mensaje: '¡Descarga Completa!' });
    // Ajusta la IP a tu backend real
    this.urlDescarga = 'http://172.20.23.41:8000/descargas/resultado.zip';
    this.mostrarPopup = true;
  }

  irANuevaDescarga() {
    this.mostrarPopup = false;
    // Navega a la pantalla principal o donde estén los filtros
    this.router.navigate(['/descarga-folios']); 
  }

  descargaArchivo() {
    if (this.urlDescarga) {
      window.open(this.urlDescarga, '_blank');
    }
  }

  cerrarPopup() {
    this.mostrarPopup = false;
    this.wsService.cerrar();
    this.router.navigate(['/']); // O al home
  }

  ngOnDestroy() {
    // Es buena práctica cerrar la conexión al salir del componente
    this.wsService.cerrar();
  }
}