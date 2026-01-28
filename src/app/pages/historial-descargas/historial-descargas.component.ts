import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistorialDescarga } from '../../models/historial.descarga.model';

@Component({
  selector: 'app-historial-descargas',
  standalone: true,
  imports: [
    RouterLink, 
    CommonModule,    
    MatIconModule,
    MatButtonModule,
    MatTooltipModule 
  ],
  templateUrl: './historial-descargas.html',
  styleUrls: ['./historial-descargas.css']
})
export class HistorialDescargas implements OnInit {

  historial: HistorialDescarga[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.historial = [
      {
        id: 101,
        fechaReal: new Date(), 
        fechaLabel: 'Hoy',
        delegacion: 'Campeche', 
        archivos: 1500,        
        mes: 'Febrero - Marzo', 
        rutaRed: 'C:\\Recibos\\Campeche\\Folio_02',
        tamanio: '1.2 GB',
        estado: 'completado',
        ruta: 'C:\\Recibos\\Campeche\\Folio_02',
        hace: 'Hace 5 minutos',
        huboErrores: false
      },
      {
        id: 2,
        fechaReal: new Date(), 
        fechaLabel: 'Ayer',
        delegacion: 'Calkiní',
        mes: 'Enero',
        ruta: 'C:\\Recibos\\Calkini\\Folio12344',
        archivos: 4500,
        tamanio: '5 GB',
        hace: 'Hace 1 día',
        huboErrores: true,
        estado: 'pendiente',
        rutaRed: undefined
      },
      {
        id: 3,
        fechaReal: new Date(),
        fechaLabel: '18 de Enero de 2026',
        delegacion: 'Calkiní',
        mes: 'Enero',
        ruta: 'C:\\Recibos\\Calkini\\Folio12343',
        archivos: 4500,
        tamanio: '5 GB',
        hace: 'Hace 2 días',
        huboErrores: false,
        estado: 'error',
        rutaRed: undefined
      }
    ];
  }

  verDetalle(id: number) {
    this.router.navigate(['/historial-descargas', id]);
  }
}