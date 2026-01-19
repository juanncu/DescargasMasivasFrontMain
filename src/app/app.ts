import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';
import { SelectDescarga } from './services/select-descarga';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private apiService = inject(ApiService);

  datos: any[] = [];
  errorMensaje: string = '';

  constructor(private selectDescarga: SelectDescarga) {}

  ngOnInit() {
    // ENVIAMOS UN ID DE PRUEBA (Por ejemplo: 1)
    // Si sabes un ID real que exista en tu base de datos, pon ese en lugar del 1
    this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion !== null) {
        console.log('Delegación recibida:', delegacion);
        this.consumirApi(delegacion);
      }
    });

    //this.consumirApi(Number(delegacion));
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
