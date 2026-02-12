import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';
import { SelectDescarga } from './services/select-descarga';
import { Subscription } from 'rxjs';
import { WebSocketService } from './services/websocket';
import { Header } from './layout/header/header';
import { FiltrosCFDI } from './models/registro-descarga.model';
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { UiService } from './services/ui.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, SidebarComponent],
  templateUrl: './app.html',
})

export class App implements OnInit, OnDestroy {
  // 1. Inyecciones de dependencia
  private apiService = inject(ApiService);
  private uiService = inject(UiService);
  private cd = inject(ChangeDetectorRef); // <-- Esto quita el error de image_0ac43b.png
  private subFiltros!: Subscription;
  private subSidebar!: Subscription;

  // 2. Propiedades de la clase (Deben estar declaradas aquí)
  isSidebarOpen = false;
  datos: any[] = [];
  errorMensaje: string = '';
  cargando: boolean = false; 

  constructor(
    private wsService: WebSocketService,
    private selectDescarga: SelectDescarga,
  ) {}

  ngOnInit() {
    this.subSidebar = this.uiService.sidebarOpen$.subscribe((status) => {
      this.isSidebarOpen = status;
    });

    this.subFiltros = this.selectDescarga.filtros$.subscribe((filtros) => {
      if (filtros && filtros.delegacion !== null) {
        console.log('Filtros recibidos:', filtros);
        this.consumirApi(filtros);
      }
    });
  }

  consumirApi(filtros: FiltrosCFDI) {
    // 3. Validamos que la delegación no sea nula para que TypeScript no se queje
    if (filtros.delegacion !== null && filtros.delegacion !== undefined) {
      this.cargando = true;

      // Al estar dentro de este IF, TypeScript sabe que es un número seguro
      this.apiService.buscarFolios(filtros.delegacion, filtros).subscribe({
        next: (respuesta: any) => {
          console.log('¡Facturas recibidas!', respuesta);
          this.datos = Array.isArray(respuesta) ? respuesta : [respuesta];
          this.cargando = false;
          this.cd.detectChanges(); // Ahora 'cd' ya está inyectado correctamente
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.cargando = false;
          this.errorMensaje = `Error: ${error.status}`;
          this.cd.detectChanges();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.subFiltros) this.subFiltros.unsubscribe();
    if (this.subSidebar) this.subSidebar.unsubscribe();
    this.wsService.cerrar();
  }

  closeMenu() {
    this.uiService.toggleSidebar();
  }
}