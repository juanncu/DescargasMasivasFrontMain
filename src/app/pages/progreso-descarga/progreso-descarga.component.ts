import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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

  mostrarPopup = false;
  urlDescarga = '';

  constructor(
    private descargaService: DescargaFoliosService,
    private selectDescarga: SelectDescarga,
    private cdr: ChangeDetectorRef, // CORREGIDO: Solo se declara una vez
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // Nos suscribimos para saber qué delegación se seleccionó
    this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion !== null) {
        
        // CORREGIDO: Usamos el nombre real de la variable, no texto fijo
        this.registros.push({
          estado: 'OK',
          mensaje: `Descarga delegación ${delegacion} iniciada...`,
        });

        // Iniciamos la descarga
        this.descargaService.iniciarDescarga(delegacion).subscribe({
          next: (evento) => {
            // Lógica de Archivos
            if (evento.tipo === 'ARCHIVO') {
              this.registros.push({
                estado: evento.estado,
                mensaje: `Folio ${evento.folio} - ${this.nombreArchivo(evento.archivo)}`,
              });
            }

            // Lógica de Progreso
            if (evento.tipo === 'PROGRESO') {
              let valor = evento.progreso;
              if (typeof valor === 'string') {
                valor = valor.replace('%', '');
              }
              
              // Math.min/max es una excelente práctica aquí
              this.progreso = Math.min(100, Math.max(0, Number(valor)));
              this.tiempoEstimado = this.calcularTiempo(this.progreso);
            }
            
            // Actualizamos la vista manualmente por si acaso
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error en descarga', err);
            this.registros.push({ estado: 'ERROR', mensaje: 'Ocurrió un error en la descarga' });
            this.cdr.detectChanges();
          },
          complete: () => {
            // CORREGIDO: Ahora este bloque está dentro del subscribe correctamente
            this.registros.push({
              estado: 'OK',
              mensaje: 'Descarga finalizada',
            });

            // OJO: Esto sigue hardcodeado a localhost (te explico abajo)
            this.urlDescarga = 'http://localhost:8080/descargas/resultado.zip';
            this.mostrarPopup = true;

            this.cdr.detectChanges();
          },
        });
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

  cerrarPopup() {
    this.mostrarPopup = false;
  }

  descargaArchivo() {
    window.open(this.urlDescarga, '_blank');
    this.mostrarPopup = false;
  }
}