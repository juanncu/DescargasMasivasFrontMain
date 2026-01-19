import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';
import { SelectDescarga } from './services/select-descarga';
import { Subscription } from 'rxjs';
import { WebSocketService } from './services/websocket';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private apiService = inject(ApiService);
  private sub!: Subscription;

  datos: any[] = [];
  errorMensaje: string = '';

  constructor(
    private wsService: WebSocketService,
    private selectDescarga: SelectDescarga,
  ) {}

  ngOnInit() {
    // this.selectDescarga.delegacion$.subscribe((delegacion) => {
    //   if (delegacion !== null) {
    //     console.log('Delegación recibida:', delegacion);
    //     this.consumirApi(delegacion);
    //   }
    // });

    this.sub = this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion !== null) {
        this.wsService.conectar(delegacion);
      }
    });

    // this.wsService.onmessage((msg) => {
    //   console.log('📩 Mensaje recibido:', msg);
    // });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.wsService.cerrar();
  }

  consumirApi(id: number) {
    this.apiService.getCfdis(id).subscribe({
      next: (respuesta: any) => {
        console.log('¡Facturas recibidas!', respuesta);

        // OJO: Dependiendo de si la respuesta es una lista [] o un solo objeto {}
        // tal vez tengamos que ajustar esto. Por ahora lo dejamos así.
        // Si respuesta es un string, lo metemos en un array para que no falle el HTML
        this.datos = Array.isArray(respuesta) ? respuesta : [respuesta];
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.errorMensaje = `Error: ${error.status} - ${error.statusText}`;
      },
    });
  }
}
