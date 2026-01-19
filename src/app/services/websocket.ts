import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;

  conectar(delegacionId: number) {
    this.ws = new WebSocket(`ws://172.20.23.44:8000/socket/${delegacionId}`);

    this.ws.onopen = () => {
      console.log('🟢 Conectado');
    };

    this.ws.onmessage = (e) => {
      console.log('📩 Mensaje:', e.data);
    };

    this.ws.onclose = () => {
      console.log('🟡 Cerrado');
    };

    this.ws.onerror = (e) => {
      console.error('🔴 Error', e);
    };
  }

  cerrar() {
    this.ws?.close();
    this.ws = null;
  }

  ngOnDestroy() {
    this.cerrar();
  }
}
