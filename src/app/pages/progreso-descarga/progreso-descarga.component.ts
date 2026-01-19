import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-descarga.html',
  styleUrls: ['./progreso-descarga.css']
})
export class ProgresoDescargaComponent implements OnInit {

  progreso = 0;
  registros: RegistroDescarga[] = [];
  tiempoEstimado = 'Calculando...';

  mostrarPopup=false;
  urlDescarga='';

  constructor(
    private descargaService: DescargaFoliosService,
    private cdr: ChangeDetectorRef   // CLAVE
  ) {}

  ngOnInit(): void {

    // Log inicial
    this.registros.push({
      estado: 'OK',
      mensaje: 'Descarga delegación Calkiní iniciada...'
    });

    this.descargaService.iniciarDescarga().subscribe({
      next: (evento) => {

        if (evento.tipo === 'ARCHIVO') {
          this.registros.push({
            estado: evento.estado,
            mensaje: `Folio ${evento.folio} - ${this.nombreArchivo(evento.archivo)} ${evento.estado === 'OK' ? 'generado' : 'no generado'}`
          });
        }

        if (evento.tipo === 'PROGRESO') {
          this.progreso = evento.progreso;
          this.tiempoEstimado = this.calcularTiempo(evento.progreso);

          // FUERZA ACTUALIZACIÓN DE LA UI
          this.cdr.detectChanges();
        }
      },


complete: () => {
  this.registros.push({
    estado: 'OK',
    mensaje: 'Descarga finalizada'
  });

  // URL del backend
  this.urlDescarga = 'http://localhost:8080/descargas/resultado.zip';
  this.mostrarPopup = true;

  this.cdr.detectChanges();
}

    });
  }

  nombreArchivo(archivo: string): string {
    if (archivo.includes('recibo')) return 'Recibo';
    if (archivo.includes('cfdi.pdf')) return 'CFDI';
    if (archivo.includes('cfdi.xml')) return 'XML';
    return archivo;
  }

  calcularTiempo(progreso: number): string {
    if (progreso === 0) return 'Calculando...';
    const restante = 100 - progreso;
    return `${Math.round(restante * 0.7)} segundos restantes`;
  }


cerrarPopup (){

 this.mostrarPopup = false;

}
descargaArchivo() {
  window.open(this.urlDescarga, '_blank');
  this.mostrarPopup = false; 
}

}