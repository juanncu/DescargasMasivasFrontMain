import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';
import { SelectDescarga } from '../../services/select-descarga';
import { WebSocketService } from '../../services/websocket'; // <--- 1. IMPORTANTE

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-descarga.html',
  styleUrls: ['./progreso-descarga.css'],
})
export class ProgresoDescargaComponent implements OnInit, OnDestroy {
  progreso = 0;
  registros: RegistroDescarga[] = [];
  tiempoEstimado = 'Calculando...';
  mostrarPopup = false;
  urlDescarga = '';

  constructor(
    private descargaService: DescargaFoliosService,
    private selectDescarga: SelectDescarga,
    private wsService: WebSocketService, // <--- 2. INYECTAR SERVICIO WS
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion) {
        const idDelegacion = Number(delegacion);
        
        // A. Iniciamos la conexión WebSocket PRIMERO
        this.wsService.conectar(idDelegacion);

        // B. Nos suscribimos a los mensajes en tiempo real
        this.wsService.mensajes$.subscribe({
          next: (data) => {
            // data es: {actual: 61, total: 2000, porcentaje: 3, factura: "..."}
            
            // 1. Actualizar barra de progreso
            this.progreso = data.porcentaje;

            // 2. Agregar al registro (Log)
            // Solo agregamos si hay un número de factura
            if (data.factura) {
              this.registros.unshift({ // 'unshift' pone el más nuevo arriba
                estado: 'OK',
                mensaje: `[${data.actual}/${data.total}] Procesando factura: ${data.factura}`
              });
            }

            // 3. Calcular tiempo estimado
            this.tiempoEstimado = this.calcularTiempo(data.actual, data.total);

            // 4. Detectar fin (cuando llega al 100%)
            if (this.progreso >= 100) {
              this.finalizarDescarga();
            }

            this.cdr.detectChanges();
          },
          error: (err) => console.error('Error WS:', err)
        });

        this.registros.push({
          estado: 'OK',
          mensaje: `Iniciando descarga para delegación ${delegacion}...`,
        });

        // C. Disparamos la petición HTTP para que el backend empiece a trabajar
        // (El backend responderá por el WebSocket que ya conectamos arriba)
        this.descargaService.iniciarDescarga(delegacion).subscribe({
            error: (e) => {
                console.error("Error al iniciar proceso:", e);
                this.registros.push({ estado: 'ERROR', mensaje: 'No se pudo iniciar el proceso.' });
            }
        });
      }
    });
  }

  calcularTiempo(actual: number, total: number): string {
    if (actual === 0) return 'Calculando...';
    // Lógica simple: si procesamos 'actual' facturas en X tiempo...
    const pendientes = total - actual;
    // Esto es un estimado visual, puedes ajustarlo
    return `${pendientes} archivos pendientes`;
  }

  finalizarDescarga() {
    this.registros.unshift({ estado: 'OK', mensaje: '¡Descarga Completa!' });
    // Ajusta la IP aquí si es necesario
    this.urlDescarga = 'http://172.20.23.41:8000/descargas/resultado.zip'; 
    this.mostrarPopup = true;
  }

  cerrarPopup() {
    this.mostrarPopup = false;
    // A. Cortamos la conexión con el servidor (Detiene la "ejecución")
    this.wsService.cerrar(); 
    
    // B. Regresamos a la pantalla de selección (Inicio)
    // Asumiendo que tu ruta principal es '' o '/'
    this.router.navigate(['/']);
  }

  descargaArchivo() {
    window.open(this.urlDescarga, '_blank');
  }

  ngOnDestroy() {
    // Importante desconectar al salir de la pantalla
    this.wsService.cerrar();
  }
}