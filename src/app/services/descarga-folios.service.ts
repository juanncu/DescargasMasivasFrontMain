import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketService } from './websocket';

@Injectable({
  providedIn: 'root',
})
export class DescargaFoliosService {
  constructor(private wsService: WebSocketService) {}

  buscarFolios(delegacion: string, filtro: string, mesFinal: string, anio: number, estadoSeleccionado: string, padronSeleccionado: string) {
    return {
      archivos: 1500,
      tamanio: '1 GB',
      tiempo: '5 minutos',
    };
  }

  // (conectado al progreso)
  descargar(delegacion: string) {
    console.log('Descargando delegación:', delegacion);
  }

  //
  
  iniciarDescarga(delegacion: number): Observable<any> {
    this.wsService.conectar(delegacion);
    return this.wsService.mensajes$;
  }
}
