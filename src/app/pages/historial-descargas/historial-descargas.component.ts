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
  detalle!: HistorialDescarga;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.historial = [
      {
        id: 1,
        fechaReal: new Date(),
        fechaLabel: 'Hoy',
        delegacion: 'Campeche',
        archivos: 1500,
        mes: 'Enero - Febrero',
        totalPdf: 1500,
        totalXml: 1500,
        totalRecibos: 1500,
        omitidos: 0,
        anio: 2026,             
        formatos: 'PDF, XML',   
        padron: 'Todas',       
        estadoFiltro: 'Ambos', 
        rutaRed: 'C:\\Recibos\\Campeche\\Folio_01',
        tamanio: '1.2 GB',
        estado: 'completado',
        huboErrores: false
      },
      {
        id: 2,
        fechaReal: new Date(),
        fechaLabel: 'Ayer',
        delegacion: 'Calkiní',
        archivos: 1500,
        mes: 'Febrero - Marzo',
        totalPdf: 1500,
        totalXml: 1500,
        totalRecibos: 1500,
        omitidos: 0,
        anio: 2026,            
        formatos: 'PDF, XML',   
        padron: 'Todas',        
        estadoFiltro: 'Ambos', 
        rutaRed: 'C:\\Recibos\\Campeche\\Folio_02',
        tamanio: '5 GB',
        huboErrores: true,
        estado: 'pendiente',
      },
      {
        id: 3,
        fechaReal: new Date(),
        fechaLabel: 'Ayer',
        delegacion: 'Carmen',
        archivos: 500,
        mes: 'Marzo - Abril',
        totalPdf: 1450,
        totalXml: 1450,
        totalRecibos: 1500,
        omitidos: 0,
        anio: 2026,             
        formatos: 'PDF, XML',   
        padron: 'Todas',         
        estadoFiltro: 'Ambos',  
        tamanio: '5 GB',
        huboErrores: true,
        estado: 'pendiente',
        rutaRed: 'undefined'
      },
    ];
  }

  verDetalle(descarga: HistorialDescarga) {
  // Aquí asignamos el objeto completo del historial a la variable que usa el HTML
  this.detalle = descarga; 
  console.log('Viendo detalle de:', this.detalle);
  
  // Si usas rutas, asegúrate de navegar pasando el ID
  this.router.navigate(['/historial-descargas', descarga.id]);
}
}