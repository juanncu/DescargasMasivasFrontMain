import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;

  private mensajesSubject = new Subject<any>();
  mensajes$: Observable<any> = this.mensajesSubject.asObservable();

  conectar(delegacionId: number) {
    this.ws = new WebSocket(`ws://172.20.23.44:8000/socket/${delegacionId}`);

    this.ws.onopen = () => {
      console.log('🟢 Conectado');
    };

    this.ws.onmessage = (e) => {
      console.log('📩 Mensaje:', e.data);
      const data = JSON.parse(e.data); // 👈 IMPORTANTE
      this.mensajesSubject.next(data); // 👈 EMITE A ANGULAR
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
    this.mensajesSubject.complete();
  }
}
