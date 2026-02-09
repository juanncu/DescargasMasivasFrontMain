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
        fechaLabel: 'Hoy',
        delegacion: 'Campeche',
        mesInicio: 'Enero', // Separado
        mesFinal: 'Febrero', // Separado
        anio: 2025, // Año correcto
        formatos: ['PDF', 'XML'], // Array para *ngFor
        padron: 'TODOS',
        estadoFiltro: 'AMBOS',
        rutaRed: 'C:\\Recibos\\Campeche\\Folio_01',
        tamanio: '1.2 GB',
        estado: 'completado',
        archivos: 0,
        huboErrores: false,
        totalPdf: 0,
        totalXml: 0,
        totalRecibos: 0,
        omitidos: 0
      },
      {
        id: 2,
        fechaLabel: 'Ayer',
        delegacion: 'Calkiní',
        mesInicio: 'Febrero',
        mesFinal: 'Marzo',
        anio: 2025,
        formatos: ['PDF', 'XML', 'RECIBOS'], // Etiquetas dinámicas
        padron: 'TODOS',
        estadoFiltro: 'ACTIVOS',
        rutaRed: 'C:\\Recibos\\Campeche\\Folio_02',
        tamanio: '5 GB',
        estado: 'pendiente',
        archivos: 0,
        huboErrores: false,
        totalPdf: 0,
        totalXml: 0,
        totalRecibos: 0,
        omitidos: 0
      }
    ];
  }

  verDetalle(id: number) {
    this.router.navigate(['/historial-descargas', id]);
  }
}