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
  mesInicio = '';
  resultados: any = null;
  // Lista donde se guardan los municipios
  listaDelegaciones: any[] = []; 
  // NUEVAS VARIABLES PARA EL FORMULARIO
  estadoSeleccionado = 'Ambos'; // Valor por defecto
  padronSeleccionado = 'Todas';  // Valor por defecto
  mesFinal = '';
  anio: number = 2026;
  // Lista de meses para no repetirlos en el HTML
  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];

  constructor() {}

  ngOnInit() {
    this.anio = new Date().getFullYear();
    console.log("Iniciando carga de municipios...");
    
    this.apiService.getMunicipios().subscribe({
      next: (respuesta: any) => {
        
        console.log("Respuesta completa del servidor:", respuesta);

        if (respuesta && respuesta.municipios) {
          this.listaDelegaciones = respuesta.municipios;
          console.log("Lista extraída correctamente:", this.listaDelegaciones);
        } else {
          this.listaDelegaciones = respuesta;
        }
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error("Error cargando municipios:", error);
      }
    });
  }

  buscar() {
    // Actualiza la validación con los nuevos campos
    if (!this.delegacionSeleccionada || !this.mesInicio || !this.mesFinal || !this.anio) {
      alert('Por favor complete todos los filtros de descarga');
      return;
    }

    const delegacionId = Number(this.delegacionSeleccionada);
    const buscar = false;

    // Aquí pasarías todos los nuevos valores al servicio
    this.resultados = this.descargaService.buscarFolios(
      this.delegacionSeleccionada,
      this.mesInicio,
      this.mesFinal,
      this.anio,
      this.estadoSeleccionado,
      this.padronSeleccionado
    );
    console.log("Resultados cargados:", this.resultados);
    this.selectDescarga.setDelegacion(delegacionId);
  }

  confirmarDescarga() {
    console.log('CLICK CONFIRMAR');
    this.router.navigate(['/progreso-descarga']);
  }
}