import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.services';

import { Subscription } from 'rxjs';
import{ interval } from 'rxjs';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive, CommonModule]
})
export class SidebarComponent implements OnInit, OnDestroy {

  public isSidebarOpen = false;
  private sub!: Subscription;

  // Fecha y hora
  horaActual: Date = new Date();
  private intervaloHora: any;

  constructor(private router: Router, private uiService: UiService) {}

  // inicia el componente
  ngOnInit(): void {

    // sidebar open/close
    this.sub = this.uiService.sidebarOpen$.subscribe(status => {
      this.isSidebarOpen = status;
    }); 
    this.intervaloHora = interval(1000).subscribe(() => {
      this.horaActual = new Date();
    });

    // reloj
    this.intervaloHora = setInterval(() => {
      this.horaActual = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.intervaloHora) {
      this.intervaloHora.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.uiService.toggleSidebar();
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }

}