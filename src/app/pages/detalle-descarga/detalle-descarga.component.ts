import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-detalle-descarga',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './detalle-descarga.html',
  styleUrls: ['./detalle-descarga.css']
})
export class DetalleDescarga implements OnInit {

  id!: number;
  detalle: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : 0;
    
    console.log('Cargando detalle del ID:', this.id);
    this.cargarDatosSimulados(this.id);
  }

  cargarDatosSimulados(id: number) {
    if (id === 101) {
      this.detalle = {
        delegacion: 'Campeche',
        mes: 'Febrero - Marzo',
        estado: 'COMPLETADO',
        ruta: 'C:/Recibos/Campeche/Folio_02',
        inicio: '27/01/2026 09:00 AM',
        fin: '27/01/2026 09:15 AM',
        tiempo: '15 minutos',
        tamanio: '1.2 GB',
        folios: 1500,
        archivos: 1500,
        errores: 0,
        registros: [
          { estado: 'OK', mensaje: 'Inicio de descarga exitoso' },
          { estado: 'OK', mensaje: 'Todos los archivos procesados' }
        ]
      };
    } else {
      this.detalle = {
        delegacion: 'Calkiní',
        mes: 'Enero 2026',
        estado: 'COMPLETADO_CON_ERRORES',
        ruta: 'C:/Recibos/Calkini/Enero',
        inicio: '18/01/2026 10:30 AM',
        fin: '18/01/2026 10:35 AM',
        tiempo: '5 minutos',
        tamanio: '5 GB',
        folios: 1500,
        archivos: 4500,
        errores: 3,
        registros: [
          { estado: 'OK', mensaje: 'Folio 12345 - Recibo generado' },
          { estado: 'OK', mensaje: 'Folio 12345 - CFDI generado' },
          { estado: 'OK', mensaje: 'Folio 12345 - XML guardado' },
          { estado: 'ERROR', mensaje: 'Folio 12325 - Recibo no generado' }
        ]
      };
    }
  }

  volver() {
    this.router.navigate(['/historial-descargas']);
  }
}