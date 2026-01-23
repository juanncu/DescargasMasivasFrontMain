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
  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);

  delegacionSeleccionada = '';
  mesInicio = '';
  mesFinal = '';
  anio: number = new Date().getFullYear();
  estadoSeleccionado = 'Ambos';
  padronSeleccionado = 'Todas';
  
  resultados: any = null;
  listaDelegaciones: any[] = []; 

  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];

  ngOnInit() {
    this.cargarMunicipios();
  }

  cargarMunicipios() {
    this.apiService.getMunicipios().subscribe({
      next: (respuesta: any) => {
        // Validación robusta de la respuesta
        if (respuesta && respuesta.municipios) {
          this.listaDelegaciones = respuesta.municipios;
        } else if (Array.isArray(respuesta)) {
          this.listaDelegaciones = respuesta;
        } else {
          this.listaDelegaciones = [];
        }
        
        console.log("Municipios listos para el select:", this.listaDelegaciones);
        this.cd.detectChanges(); // Forzamos renderizado
      },
      error: (err) => console.error("Error en API:", err)
    });
  }

  buscar() {
    if (!this.delegacionSeleccionada || !this.mesInicio || !this.mesFinal) {
      alert('Por favor complete todos los filtros');
      return;
    }

    this.resultados = this.descargaService.buscarFolios(
      this.delegacionSeleccionada,
      this.mesInicio,
      this.mesFinal,
      this.anio,
      this.estadoSeleccionado,
      this.padronSeleccionado
    );
    
    // Guardamos el ID en el servicio compartido para la siguiente pantalla
    this.selectDescarga.setDelegacion(Number(this.delegacionSeleccionada));
  }

  confirmarDescarga() {
    this.router.navigate(['/progreso-descarga']);
  }
}