import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // RouterModule incluye RouterLink
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// Asegúrate que las rutas sean correctas
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatIconModule],
  templateUrl: './descarga-folios.html',
  styleUrls: ['./descarga-folios.css'],
  providers: [DescargaFoliosService]
})
export class DescargaFoliosComponent implements OnInit {

  // --- INYECCIONES (Estilo moderno) ---
  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);

  // --- VARIABLES DEL FORMULARIO ---
  delegacionSeleccionada = '';
  mesInicio = '';
  mesFinal = '';
  anio: number = new Date().getFullYear();
  
  // Valores por defecto
  estadoSeleccionado = 'Ambos';
  padronSeleccionado = 'Todas';

  // --- VARIABLES DE ESTADO ---
  listaDelegaciones: any[] = [];
  resultados: any = null;
  cargando = false;
  mostrarPopupConfirmacion = false;

  // Catálogo de meses para el HTML
  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];

  ngOnInit() {
    console.log('Iniciando componente...');
    this.cargarMunicipios();
  }

  cargarMunicipios() {
    this.apiService.getMunicipios().subscribe({
      next: (respuesta: any) => {
        // Validación robusta para evitar errores si la respuesta cambia
        if (respuesta && respuesta.municipios) {
          this.listaDelegaciones = respuesta.municipios;
        } else if (Array.isArray(respuesta)) {
          this.listaDelegaciones = respuesta;
        } else {
          this.listaDelegaciones = [];
          console.warn('Formato de municipios desconocido:', respuesta);
        }
        
        console.log("Municipios cargados:", this.listaDelegaciones);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando municipios:", err);
      }
    });
  }

  buscar() {
    // 1. Validaciones
    if (!this.delegacionSeleccionada || !this.mesInicio || !this.mesFinal || !this.anio) {
      alert('Por favor complete todos los filtros antes de buscar.');
      return;
    }

    this.cargando = true;
    this.resultados = null;

    // --- CONVERSIÓN DE PADRÓN (Texto -> Número) ---
    let padronId = 0; // 0 = Todas
    if (this.padronSeleccionado === 'Predial') {
      padronId = 1;
    }

    // --- CONVERSIÓN DE ESTADO (Texto -> Número) ---
    let estadoId = 3; // 3 = Ambos (Default)
    if (this.estadoSeleccionado === 'Activo') {
      estadoId = 1;
    } else if (this.estadoSeleccionado === 'Cancelar') {
      estadoId = 2;
    }

    // --- CÁLCULO DE FECHAS---
    // Calculamos fechaInicio (YYYY-MM-01)
    const mesIniStr = this.mesInicio.toString().padStart(2, '0');
    const fechaInicio = `${this.anio}-${mesIniStr}-01`;

    // Calculamos fechaFin (YYYY-MM-UltimoDia)
    const ultimoDia = new Date(this.anio, Number(this.mesFinal), 0).getDate();
    const mesFinStr = this.mesFinal.toString().padStart(2, '0');
    const fechaFin = `${this.anio}-${mesFinStr}-${ultimoDia}`;

    // 2. Preparar filtros
    const filtros = {
      delegacion: Number(this.delegacionSeleccionada),
      padron: padronId,
      estado: estadoId,
      ini: fechaInicio, 
      fin: fechaFin    
    };

    console.log('Enviando filtros a API:', filtros);

    this.selectDescarga.setFiltros(filtros);

    // 3. Llamada al servicio
    this.descargaService.buscarFolios(this.delegacionSeleccionada, '', filtros)
      .subscribe({
        next: (resultados) => {
          this.resultados = resultados;
          this.cargando = false;
          this.cd.detectChanges();
        },
        error: (error) => {
          console.error('Error al buscar folios:', error);
          this.cargando = false;
          alert('Ocurrió un error al buscar la información.');
        }
      });
  }

  confirmarDescarga() {
    // 1. Obtener nombre de la delegación para el historial
    const delegacionEncontrada = this.listaDelegaciones.find(
      d => (d.Id || d.id) == this.delegacionSeleccionada
    );
    const nombreDelegacion = delegacionEncontrada ? (delegacionEncontrada.Nombre || delegacionEncontrada.nombre) : 'Desconocida';

    // 2. Crear objeto para el historial
    const nuevaDescarga = {
      delegacion: nombreDelegacion,
      mes: `${this.obtenerNombreMes(this.mesInicio)} - ${this.obtenerNombreMes(this.mesFinal)}`,
      archivos: this.resultados?.archivos || 0,
      tamanio: this.resultados?.tamanio || '0 KB',
      anio: this.anio,
      estado: 'pendiente',
      fecha_creacion: new Date()
    };

    // 3. Mostrar popup visual
    this.mostrarPopupConfirmacion = true;

    // 4. Registrar en Backend (Historial)
    this.apiService.registrarNuevaDescarga(nuevaDescarga).subscribe({
      next: (res) => console.log('Registro exitoso en historial'),
      error: (err) => console.warn('No se pudo guardar en historial (pero la descarga procede):', err)
    });
  }

  // --- FUNCIONES AUXILIARES ---

  irAlHistorial() {
    this.mostrarPopupConfirmacion = false;
    this.router.navigate(['/historial-descargas']);
  }

  reiniciarFiltros() {
    this.mostrarPopupConfirmacion = false;
    this.resultados = null;
    this.delegacionSeleccionada = '';
    this.mesInicio = '';
    this.mesFinal = '';
    // Reseteamos a valores por defecto
    this.estadoSeleccionado = 'Ambos';
    this.padronSeleccionado = 'Todas';
  }

  obtenerNombreMes(id: any): string {
    const mes = this.meses.find(m => m.id == id);
    return mes ? mes.nombre : String(id);
  }
}