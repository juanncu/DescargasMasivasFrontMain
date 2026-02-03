import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSocketService } from './websocket';
import { ApiService } from './api';
// Si no tienes este modelo específico, puedes cambiarlo por 'any' abajo
import { FiltrosCFDI } from '../models/registro-descarga.model'; 

@Injectable({
  providedIn: 'root',
})
export class DescargaFoliosService {
  private wsService = inject(WebSocketService);
  private apiService = inject(ApiService);

  /**
   * Busca los folios usando la API real y calcula el tamaño total.
   */
  buscarFolios(delegacion: string, filtro: string, filtros: any): Observable<any> {
    // Llamada real al Backend
    return this.apiService.getCfdisConFiltros(filtros).pipe(
      map((data: any) => {
        // Validación por si la data viene nula
        //const listaArchivos = Array.isArray(data) ? data : [];
        
        const totalArchivos = data.total;
        const tamanioTotal = this.calcularTamanio(totalArchivos);

        // Calculamos un tiempo estimado (ejemplo: 0.5 segundos por archivo)
        // Puedes ajustar esta fórmula según la velocidad real de tu servidor
        const tiempoEstimado = totalArchivos > 0 
          ? this.formatearTiempo(totalArchivos * 0.5) 
          : '0 seg';

        return {
          archivos: totalArchivos,
          tamanio: tamanioTotal,
          tiempo: tiempoEstimado
        };
      })
    );
  }

  /**
   * Inicia el proceso de descarga.
   * 1. Conecta el WebSocket para escuchar progreso.
   * 2. Manda la orden HTTP al backend para que empiece a trabajar.
   */
  iniciarDescarga(delegacionId: number): Observable<any> {
    console.log('Servicio: Iniciando descarga para delegación', delegacionId);
    
    // 1. Aseguramos que el WS esté escuchando
    this.wsService.conectar(delegacionId);

    // 2. Mandamos la orden al backend (Asumiendo que tienes este método en ApiService)
    // Si tu ApiService no tiene 'iniciarProceso', cámbialo por la llamada HTTP correspondiente
    if (this.apiService.iniciarProcesoDescarga) {
        return this.apiService.iniciarProcesoDescarga(delegacionId);
    } else {
        // Fallback: Si no tienes el método aún, simulamos que el back respondió "OK"
        // para que no se rompa el frontend.
        console.warn('⚠️ ApiService.iniciarProcesoDescarga no existe. Usando fallback.');
        return of({ success: true, message: 'Proceso iniciado (Simulado)' });
    }
  }

  // --- MÉTODOS PRIVADOS (AYUDANTES) ---

  private calcularTamanio(data: number): string {
    const tamanioKB = data * 3000;
    const tamanioMB = tamanioKB / 1024;

    if (tamanioMB < 1024) {
      return `${tamanioMB.toFixed(2)} MB`;
    }

    const tamanioGB = tamanioMB / 1024;
    return `${tamanioGB.toFixed(2)} GB`;
  }

  private formatearTiempo(segundos: number): string {
    if (segundos < 60) return `${Math.ceil(segundos)} segundos`;
    const minutos = Math.ceil(segundos / 60);
    return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  }
}
