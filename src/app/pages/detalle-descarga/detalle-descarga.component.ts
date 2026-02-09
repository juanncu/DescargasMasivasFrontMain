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
    this.cargarDatosSimulados(this.id);
  }

  cargarDatosSimulados(id: number) {
    // Simulamos la estructura exacta que pide el diseño
    this.detalle = {
      delegacion: id === 101 ? 'Campeche' : 'Calkiní',
      periodoLabel: id === 101 ? 'Febrero - Marzo 2026' : 'Enero 2026',
      estado: id === 101 ? 'COMPLETADO' : 'COMPLETADO_CON_ERRORES',
      

      filtrosAplicados: {
      padron: id === 101 ? 'Vehicular' : 'Todos',
      estadoRecibo: id === 101 ? 'Activos' : 'Ambos',
      formatos: id === 101 ? ['PDF', 'XML'] : ['PDF', 'XML', 'Recibos']
    },
    
      // Contadores para las tarjetas superiores
      stats: {
        pdfs: id === 101 ? 1500 : 0,
        xmls: id === 101 ? 1500 : 0,
        recibos: id === 101 ? 1500 : 0,
        omitidos: id === 101 ? 0 : 0 // Basado en tu imagen
      },

      // Detalles Técnicos
      tecnico: {
        ruta: id === 101 ? 'C:/Recibos/Campeche/Febrero' : 'C:/Recibos/Calkini/Enero',
        inicio: id === 101 ? '27/01/2026 09:00 AM' : '18/01/2026 10:30 AM',
        fin: id === 101 ? '27/01/2026 09:15 AM' : '18/01/2026 10:35 AM',
        tiempo: id === 101 ? '15 minutos' : '5 minutos'
      },

      // Registro de actividad (Consola negra)
      logs: [
        { tipo: 'OK', mensaje: 'Folio 12345 - Recibo generado' },
        { tipo: 'OK', mensaje: 'Folio 12345 - CFDI generado' },
        { tipo: 'OK', mensaje: 'Folio 12345 - XML guardado' },
        { tipo: 'ERROR', mensaje: 'Folio 12325 - Recibo no generado' }
      ]
    };
  }

  volver() {
    this.router.navigate(['/historial-descargas']);
  }
}