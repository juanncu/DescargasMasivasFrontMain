import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatIconModule],
  templateUrl: './descarga-folios.html',
  styleUrls: ['./descarga-folios.css'],
  providers: [DescargaFoliosService],
})
export class DescargaFoliosComponent implements OnInit {
  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  delegacionSeleccionada = '';
  mesInicio = '';
  mesFinal = '';
  anio: number = new Date().getFullYear();

  // Listas para Select de Katia
  estados = [
    { id: '1', nombre: 'ACTIVO', estadoID: '1, 3, 4' },
    { id: '2', nombre: 'CANCELADO', estadoID: '2' },
    { id: '3', nombre: 'AMBOS', estadoID: '1, 2, 3, 4' }
  ];

  padrones = [
    { id: '1', nombre: 'TODOS', padronID: '1, 3, 4, 5, 6' },
    { id: '2', nombre: 'PREDIAL', padronID: '2' }
  ];

  // Vinculación con los nuevos Selects
  estadoSeleccionadoId = null;
  padronSeleccionadoId = null;

  listaDelegaciones: any[] = [];
  resultados: any = null;
  cargando = false;
  mostrarPopupConfirmacion = false;

  // Filtros de formato
  formatoPdf: boolean = true;
  formatoXml: boolean = true;
  formatoRecibos: boolean = false;

  progreso = 0;
  tiempoEstimado = 'Calculando...';
  aniosDisponibles: number[] = [2026, 2025];

  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' },
  ];

  ngOnInit() {
    this.cargarMunicipios();
    this.anio = 2026;
  }

  cargarMunicipios() {
    this.apiService.getMunicipios().subscribe({
      next: (respuesta: any) => {
        this.listaDelegaciones = respuesta.delegacion || (Array.isArray(respuesta) ? respuesta : []);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error cargando municipios:', err),
    });
  }

  buscar() {
    if (!this.delegacionSeleccionada || !this.mesInicio || !this.mesFinal || !this.anio || !this.estadoSeleccionadoId || !this.padronSeleccionadoId) {
      alert('Por favor complete todos los filtros antes de buscar.');
      return;
    }

    if (!this.formatoPdf && !this.formatoXml && !this.formatoRecibos) {
      alert('Por favor, seleccione al menos un formato (PDF, XML o Recibos)');
      return;
    }

    this.cargando = true;
    this.resultados = null;

    // Procesamiento de fechas
    const mesIniStr = this.mesInicio.toString().padStart(2, '0');
    const fechaInicio = `${this.anio}-${mesIniStr}-01`;
    const ultimoDia = new Date(this.anio, Number(this.mesFinal), 0).getDate();
    const mesFinStr = this.mesFinal.toString().padStart(2, '0');
    const fechaFin = `${this.anio}-${mesFinStr}-${ultimoDia}`;

    const filtros = {
      delegacion: Number(this.delegacionSeleccionada),
      estado: Number(this.estadoSeleccionadoId),
      padron: Number(this.padronSeleccionadoId),
      ini: fechaInicio,
      fin: fechaFin,
      anio: this.anio
    };

    this.selectDescarga.setFiltros(filtros);

    this.descargaService.buscarFolios(this.delegacionSeleccionada, '', filtros).subscribe({
      next: (resultados) => {
        this.resultados = resultados;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar folios:', error);
        this.cargando = false;
      },
    });
  }

  confirmarDescarga() {
    const delegacionEncontrada = this.listaDelegaciones.find(d => (d.Id || d.id) == this.delegacionSeleccionada);
    const nombreDelegacion = delegacionEncontrada ? (delegacionEncontrada.Nombre || delegacionEncontrada.nombre) : 'Desconocida';

    const nuevaDescarga = {
      delegacion: nombreDelegacion,
      mes: `${this.obtenerNombreMes(this.mesInicio)} - ${this.obtenerNombreMes(this.mesFinal)}`,
      archivos: this.resultados?.archivos || 0,
      tamanio: this.resultados?.tamanio || '0 KB',
      anio: this.anio,
      estado: 'pendiente',
      fecha_creacion: new Date(),
    };

    this.progreso = 0;
    this.mostrarPopupConfirmacion = true;

    this.descargaService.iniciarDescarga(Number(this.delegacionSeleccionada)).subscribe({
      next: (evento) => {
        this.zone.run(() => {
          if (evento.tipo?.toUpperCase() === 'PROGRESO') {
            const valor = parseFloat(evento.progreso.toString().replace('%', ''));
            if (!isNaN(valor)) {
              this.progreso = Math.min(100, Math.max(0, valor));
              this.tiempoEstimado = this.calcularTiempoRestante(this.progreso);
            }
          }
        });
      },
      error: (err) => console.error('Error en WebSocket:', err),
    });

    this.apiService.registrarNuevaDescarga(nuevaDescarga).subscribe({
      next: () => console.log('Registro exitoso'),
      error: (err) => console.warn('Error en historial:', err),
    });
  }

  calcularTiempoRestante(p: number): string {
    if (p >= 100) return 'Completado';
    const segundos = Math.round((100 - p) * 0.6);
    return `${segundos} seg. restantes aprox.`;
  }

  irAlHistorial() {
    this.mostrarPopupConfirmacion = false;
    this.router.navigate(['/historial-descargas']);
  }

  reiniciarFiltros() {
    this.mostrarPopupConfirmacion = false;
    this.resultados = null;
    this.delegacionSeleccionada = '';
    this.estadoSeleccionadoId = null;
    this.padronSeleccionadoId = null;
    this.progreso = 0;
  }

  obtenerNombreMes(id: any): string {
    const mes = this.meses.find((m) => m.id == id);
    return mes ? mes.nombre : String(id);
  }

  simularProgreso() {
    this.mostrarPopupConfirmacion = true;
    this.progreso = 0;
    const intervalo = setInterval(() => {
      this.zone.run(() => {
        if (this.progreso < 100) {
          this.progreso += 10;
          this.tiempoEstimado = this.calcularTiempoRestante(this.progreso);
        } else {
          clearInterval(intervalo);
        }
        this.cd.detectChanges();
      });
    }, 500);
  }
}