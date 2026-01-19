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
  filtroSeleccionado = '';
  resultados: any = null;
  
  // Lista donde se guardan los municipios
  listaDelegaciones: any[] = []; 

  constructor() {}

  ngOnInit() {
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
    if (!this.delegacionSeleccionada || !this.filtroSeleccionado) {
      alert('Seleccione delegación y filtro');
      return;
    }

    const delegacionId = Number(this.delegacionSeleccionada);

    this.resultados = this.descargaService.buscarFolios(
      this.delegacionSeleccionada,
      this.filtroSeleccionado,
    );

    this.selectDescarga.setDatos(delegacionId, this.filtroSeleccionado);
  }

  confirmarDescarga() {
    console.log('CLICK CONFIRMAR');
    this.router.navigate(['/progreso-descarga']);
  }
}