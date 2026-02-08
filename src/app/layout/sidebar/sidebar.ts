import { Component, OnDestroy } from '@angular/core'; // Añadimos OnDestroy por buena práctica
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necesario para usar [ngClass] en standalone
import { UiService } from '../../services/ui.services'; // Revisa si lleva 's' o no
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive, CommonModule] // Agregamos CommonModule
})
export class SidebarComponent implements OnDestroy {
  // 1. Declaramos la propiedad fuera del constructor
  public isSidebarOpen = false;
  private sub: Subscription;

  constructor(private router: Router, private uiService: UiService) {
    // 2. Nos suscribimos correctamente
    this.sub = this.uiService.sidebarOpen$.subscribe(status => {
      this.isSidebarOpen = status;
    });
  }

  // 3. Importante: Limpiar la suscripción para evitar fugas de memoria
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  // sidebar.ts
toggleMenu() {
  this.uiService.toggleSidebar(); // Esto cerrará el menú al presionar la X
}

  cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.router.navigate(['/login']);
    }
  }
}