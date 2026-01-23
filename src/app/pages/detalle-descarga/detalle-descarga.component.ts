import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
 imports: [CommonModule, MatIcon],
  selector: 'app-detalle-descarga',
  templateUrl: './detalle-descarga.html',
  styleUrls: ['./detalle-descarga.css']
})
export class DetalleDescarga implements OnInit {

  id!: number;

  detalle = {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  console.log('ID recibido:', id);
}

  volver() {
  this.router.navigate(['/historial-descargas']);
}

}
