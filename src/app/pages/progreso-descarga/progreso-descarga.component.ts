import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { RegistroDescarga } from '../../models/registro-descarga.model';
import { SelectDescarga } from '../../services/select-descarga';

@Component({
  selector: 'app-progreso-descarga',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectDescarga.delegacion$.subscribe((delegacion) => {
      if (delegacion !== null) {
        this.reiniciarVista();
        this.ejecutarSimulacion(delegacion); 
        // Para usar el real: this.iniciarDescargaReal(delegacion);
      }
    });
  }

  private reiniciarVista() {
    this.progreso = 0;
    this.registros = [];
    this.mostrarPopup = false;
  }

  private ejecutarSimulacion(delegacionId: number) {
    this.zone.run(() => {
      this.registros.unshift({ estado: 'INFO', mensaje: `MODO PRUEBA: Iniciando delegación ${delegacionId}...` });
    });

    let p = 0;
    const intervalo = setInterval(() => {
      this.zone.run(() => {
        p += 10;
        this.progreso = p;
        this.tiempoEstimado = `${Math.round((100 - p) * 0.5)} seg. restantes`;

        if (p % 20 === 0) {
          this.registros.unshift({ estado: 'OK', mensaje: `Folio SIM-${p * 100} descargado.` });
        }

        if (p >= 100) {
          clearInterval(intervalo);
          this.registros.unshift({ estado: 'OK', mensaje: 'Descarga finalizada con éxito.' });
          this.urlDescarga = 'http://172.20.23.42:8000/descargas/resultado.zip';
          this.mostrarPopup = true;
        }
        this.cdr.detectChanges();
      });
    }, 600);
  }

  irANuevaDescarga() {
    this.mostrarPopup = false;
    this.router.navigate(['/main']);
  }

  descargaArchivo() {
    if (this.urlDescarga) window.open(this.urlDescarga, '_blank');
  }

  cerrarPopup() {
    this.mostrarPopup = false;
  }
}