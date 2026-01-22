import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './descarga-folios.html',
  styleUrls: ['./descarga-folios.css'],
  providers: [DescargaFoliosService],
})
export class DescargaFoliosComponent implements OnInit {
  // Inyecciones
  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);

  // Variables
  delegacionSeleccionada = '';
  fechaInicio = '';
  fechaFin = '';
  padron = '';
  estado = '';
  filtroSeleccionado = '';
  resultados: any = null;
  cargando = false;

  // Lista donde se guardan los municipios
  listaDelegaciones: any[] = [];

  constructor() {}

  ngOnInit() {
    console.log('Iniciando carga de municipios...');

    this.apiService.getMunicipios().subscribe({
      next: (respuesta: any) => {
        console.log('Respuesta completa del servidor:', respuesta);

        if (respuesta && respuesta.municipios) {
          this.listaDelegaciones = respuesta.municipios;
          console.log('Lista extraída correctamente:', this.listaDelegaciones);
        } else {
          this.listaDelegaciones = respuesta;
        }
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando municipios:', error);
      },
    });
  }

  buscar() {
    if (
      !this.padron ||
      !this.fechaInicio ||
      !this.fechaFin ||
      !this.delegacionSeleccionada ||
      !this.estado
    ) {
      alert('Falto seleccionar algun filtro');
      return;
    }

    const delegacionId = Number(this.delegacionSeleccionada);
    const padronid = Number(this.padron);
    const estadoid = Number(this.estado);

    const filtros = {
      padron: padronid || null,
      fechaInicio: this.fechaInicio || null,
      fechaFin: this.fechaFin || null,
      delegacion: delegacionId,
      estado: estadoid || null,
    };

    this.selectDescarga.setFiltros(filtros);

    this.cargando = true;

    // Llamar con los filtros y suscribirse al Observable
    this.descargaService
      .buscarFolios(this.delegacionSeleccionada, this.filtroSeleccionado, filtros)
      .subscribe({
        next: (resultados) => {
          this.resultados = resultados;
          this.cargando = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error al buscar folios:', error);
          this.cargando = false;
          alert('Error al buscar folios');
        },
      });
  }

  confirmarDescarga() {
    console.log('CLICK CONFIRMAR');
    this.router.navigate(['/progreso-descarga']);
  }
}
