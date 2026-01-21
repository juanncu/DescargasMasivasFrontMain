import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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

  buscarFolios(delegacion: string, filtro: string, filtros: FiltrosCFDI): Observable<any> {
    return this.apiService.getCfdisConFiltros(filtros).pipe(
      map((data: any) => {
        // Procesa los datos del endpoint y calcula las métricas
        const archivos = data.length || 0;
        const tamanioTotal = this.calcularTamanio(data); // En MB o GB

        return {
          archivos: archivos,
          tamanio: tamanioTotal,
        };
      }),
    );
  }

  private calcularTamanio(data: any[]): string {
    // Ajusta esta lógica según la estructura de tus datos
    // Ejemplo: si cada registro tiene un tamaño, súmalos
    const tamanioEnBytes = data.reduce((total, item) => {
      return total + (item.tamanio || 0); // Ajusta según tu modelo
    }, 0);

    if (tamanioEnBytes > 1000000000) {
      return (tamanioEnBytes / 1000000000).toFixed(2) + ' GB';
    } else if (tamanioEnBytes > 1000000) {
      return (tamanioEnBytes / 1000000).toFixed(2) + ' MB';
    }
    return (tamanioEnBytes / 1000).toFixed(2) + ' KB';
  }

  // (conectado al progreso)
  descargar(delegacion: string) {
    console.log('Descargando delegación:', delegacion);
  }

  iniciarDescarga(delegacion: number): Observable<any> {
    this.wsService.conectar(delegacion);
    return this.wsService.mensajes$;
  }
}
