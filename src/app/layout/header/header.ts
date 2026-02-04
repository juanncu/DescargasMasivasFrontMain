import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  private router = inject(Router);

  logout() {
    const confirmar = confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (confirmar) {
      console.log('Sesión finalizada');
      

      //login
      this.router.navigate(['/login']); 
    }
  }
}