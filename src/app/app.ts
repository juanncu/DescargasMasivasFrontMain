import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';
import { SelectDescarga } from './services/select-descarga';
import { Subscription } from 'rxjs';
import { WebSocketService } from './services/websocket';
import { Header } from './layout/header/header';
import { FiltrosCFDI } from './models/registro-descarga.model';
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { UiService } from './services/ui.services'; // Corregido: sin la 's' final si tu archivo es ui.service.ts

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, SidebarComponent],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private uiService = inject(UiService); // Inyectamos el servicio de interfaz
  private subFiltros!: Subscription;
  private subSidebar!: Subscription;

  isSidebarOpen = false;
  datos: any[] = [];
  errorMensaje: string = '';

  constructor(
    private wsService: WebSocketService,
    private selectDescarga: SelectDescarga,
  ) {}

  ngOnInit() {
    // 1. Escuchar el estado del Sidebar para el Backdrop y Layout
    this.subSidebar = this.uiService.sidebarOpen$.subscribe((status) => {
      this.isSidebarOpen = status;
    });

    // 2. Escuchar filtros para la API
    this.subFiltros = this.selectDescarga.filtros$.subscribe((filtros) => {
      if (filtros.delegacion !== null) {
        console.log('Filtros recibidos:', filtros);
        this.consumirApi(filtros);
      }
    });
  }

  ngOnDestroy() {
    // Limpieza de todas las suscripciones para evitar fugas de memoria
    if (this.subFiltros) this.subFiltros.unsubscribe();
    if (this.subSidebar) this.subSidebar.unsubscribe();
    this.wsService.cerrar();
  }

  consumirApi(filtros: FiltrosCFDI) {
    this.apiService.getCfdisConFiltros(filtros).subscribe({
      next: (respuesta: any) => {
        console.log('¡Facturas recibidas!', respuesta);
        this.datos = Array.isArray(respuesta) ? respuesta : [respuesta];
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.errorMensaje = `Error: ${error.status} - ${error.statusText}`;
      },
    });
  }

  // Método opcional para cerrar el menú desde el backdrop
  closeMenu() {
    this.uiService.toggleSidebar(); // O crea un método closeSidebar() en tu servicio
  }
}