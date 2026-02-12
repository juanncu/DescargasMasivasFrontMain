import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebSocketService } from './websocket';
import { ApiService } from './api';
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
   return this.apiService.buscarFolios(filtros.delegacion, filtros).pipe(
      map((data: any) => {
        // Validación por si la data viene nula
        const listaArchivos = Array.isArray(data) ? data : [];
        
        const totalArchivos = listaArchivos.length;
        const tamanioTotal = this.calcularTamanio(listaArchivos);

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

  private calcularTamanio(data: any[]): string {
    const tamanioEnBytes = data.reduce((total, item) => {
      // Suma el tamaño si existe, si no, asume 50KB promedio por XML
      return total + (item.tamanio || 50000); 
    }, 0);

    // Conversión correcta (Base 1024)
    if (tamanioEnBytes > 1073741824) { 
      return (tamanioEnBytes / 1073741824).toFixed(2) + ' GB';
    } else if (tamanioEnBytes > 1048576) { 
      return (tamanioEnBytes / 1048576).toFixed(2) + ' MB';
    }
    return (tamanioEnBytes / 1024).toFixed(2) + ' KB';
  }

  private formatearTiempo(segundos: number): string {
    if (segundos < 60) return `${Math.ceil(segundos)} segundos`;
    const minutos = Math.ceil(segundos / 60);
    return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  }

  // En descarga-folios.service.ts
private ultimaDescargaInfo = new BehaviorSubject<any>(null);
ultimaDescarga$ = this.ultimaDescargaInfo.asObservable();

setUltimaDescarga(data: any) {
  this.ultimaDescargaInfo.next(data);
}
}