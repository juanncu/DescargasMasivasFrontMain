import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';
import { SelectDescarga } from '../../services/select-descarga';

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progreso-descarga.html',
  styleUrls: ['./progreso-descarga.css'],
})
export class ProgresoDescargaComponent implements OnInit {
  progreso = 0;
  registros: RegistroDescarga[] = [];
  tiempoEstimado = 'Calculando...';

  constructor(
    private descargaService: DescargaFoliosService,
    private selectDescarga: SelectDescarga,
    private cdr: ChangeDetectorRef, // 👈 CLAVE
  ) {}

  ngOnInit(): void {
    // Log inicial
    this.registros.push({
      estado: 'OK',
      mensaje: 'Descarga delegación Calkiní iniciada...',
    });

    // this.descargaService.iniciarDescarga().subscribe({
    //   next: (evento) => {

    //     if (evento.tipo === 'ARCHIVO') {
    //       this.registros.push({
    //         estado: evento.estado,
    //         mensaje: `Folio ${evento.folio} - ${this.nombreArchivo(evento.archivo)} ${evento.estado === 'OK' ? 'generado' : 'no generado'}`
    //       });
    //     }

    //     if (evento.tipo === 'PROGRESO') {
    //       this.progreso = evento.progreso;
    //       this.tiempoEstimado = this.calcularTiempo(evento.progreso);

    //       // 🔥 FUERZA ACTUALIZACIÓN DE LA UI
    //       this.cdr.detectChanges();
    //     }
    //   },
    //   complete: () => {
    //     this.registros.push({
    //       estado: 'OK',
    //       mensaje: 'Descarga finalizada'
    //     });
    //     this.cdr.detectChanges();
    //   }
    // });

    //const delegacionSeleccionada = 1;

    this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion !== null) {
        this.descargaService.iniciarDescarga(delegacion).subscribe({
          next: (evento) => {
            if (evento.tipo === 'ARCHIVO') {
              this.registros.push({
                estado: evento.estado,
                mensaje: `Folio ${evento.folio} - ${this.nombreArchivo(evento.archivo)}`,
              });
            }

            if (evento.tipo === 'PROGRESO') {
              this.progreso = evento.progreso;
              this.tiempoEstimado = this.calcularTiempo(evento.progreso);
              this.cdr.detectChanges();
            }
          },
        });
      }
    });

    // this.descargaService.iniciarDescarga(delegacionSeleccionada).subscribe({
    //   next: (evento) => {
    //     if (evento.tipo === 'ARCHIVO') {
    //       this.registros.push({
    //         estado: evento.estado,
    //         mensaje: `Folio ${evento.folio} - ${this.nombreArchivo(evento.archivo)}`,
    //       });
    //     }

    //     if (evento.tipo === 'PROGRESO') {
    //       this.progreso = evento.progreso;
    //       this.tiempoEstimado = this.calcularTiempo(evento.progreso);
    //       this.cdr.detectChanges(); // ✔ correcto
    //     }
    //   },
    //   complete: () => {
    //     this.registros.push({
    //       estado: 'OK',
    //       mensaje: 'Descarga finalizada',
    //     });
    //     this.cdr.detectChanges();
    //   },
    // });
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
}
