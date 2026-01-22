import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistorialDescarga } from '../../models/historial.descarga.model';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-historial-descargas',
  standalone: true,
  imports: [RouterLink, CommonModule,    MatIconModule,
      MatButtonModule,
      MatTooltipModule ],
  templateUrl: './historial-descargas.html',
  styleUrls: ['./historial-descargas.css']
})
export class HistorialDescargasComponent implements OnInit {

  historial: HistorialDescarga[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.historial = [
      {
        id: 1,
        fechaLabel: 'Hoy',
        delegacion: 'Calkiní',
        mes: 'Enero',
        ruta: 'C:\\Recibos\\Calkini\\Folio12345',
        archivos: 4500,
        tamanio: '5 GB',
        hace: 'Hace 5 minutos',
        huboErrores: false
      },
      {
        id: 2,
        fechaLabel: 'Ayer',
        delegacion: 'Calkiní',
        mes: 'Enero',
        ruta: 'C:\\Recibos\\Calkini\\Folio12344',
        archivos: 4500,
        tamanio: '5 GB',
        hace: 'Hace 1 día',
        huboErrores: true
      },
      {
        id: 3,
        fechaLabel: '18 de Enero de 2026',
        delegacion: 'Calkiní',
        mes: 'Enero',
        ruta: 'C:\\Recibos\\Calkini\\Folio12343',
        archivos: 4500,
        tamanio: '5 GB',
        hace: 'Hace 2 días',
        huboErrores: false
      }
    ];
  }

  verDetalle(id: number) {
    this.router.navigate(['/historial-descargas', id]);
  }
}
