import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core'; // Importamos NgZone
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
  providers: [DescargaFoliosService]
})
export class DescargaFoliosComponent implements OnInit {

  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);
  private zone = inject(NgZone); // Inyectamos NgZone para el progreso en tiempo real

  delegacionSeleccionada = '';
  mesInicio = '';
  mesFinal = '';
  anio: number = new Date().getFullYear();
  
  estadoSeleccionado = 'Ambos';
  padronSeleccionado = 'Todas';

  listaDelegaciones: any[] = [];
  resultados: any = { archivos: 0, tamanio: '0 KB' };
  cargando = false;
  mostrarPopupConfirmacion = false;

  // Variables de progreso
  progreso = 0;
  tiempoEstimado = 'Calculando...'; // Corregido el nombre

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
        if (respuesta && respuesta.municipios) {
          this.listaDelegaciones = respuesta.municipios;
        } else if (Array.isArray(respuesta)) {
          this.listaDelegaciones = respuesta;
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error cargando municipios:", err)
    });
  }

  buscar() {
    if (!this.delegacionSeleccionada || !this.mesInicio || !this.mesFinal || !this.anio) {
      alert('Por favor complete todos los filtros antes de buscar.');
      return;
    }

    this.cargando = true;
    this.resultados = null;

    let padronId = this.padronSeleccionado === 'Predial' ? 1 : 0;
    let estadoId = this.estadoSeleccionado === 'Activo' ? 1 : (this.estadoSeleccionado === 'Cancelar' ? 2 : 3);

    const mesIniStr = this.mesInicio.toString().padStart(2, '0');
    const fechaInicio = `${this.anio}-${mesIniStr}-01`;

    const ultimoDia = new Date(this.anio, Number(this.mesFinal), 0).getDate();
    const mesFinStr = this.mesFinal.toString().padStart(2, '0');
    const fechaFin = `${this.anio}-${mesFinStr}-${ultimoDia}`;

    const filtros = {
      delegacion: Number(this.delegacionSeleccionada),
      padron: padronId,
      estado: estadoId,
      ini: fechaInicio, 
      fin: fechaFin    
    };

    this.selectDescarga.setFiltros(filtros);

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
        }
      });
  }

  confirmarDescarga() {
    const delegacionEncontrada = this.listaDelegaciones.find(
      d => (d.Id || d.id) == this.delegacionSeleccionada
    );
    const nombreDelegacion = delegacionEncontrada ? (delegacionEncontrada.Nombre || delegacionEncontrada.nombre) : 'Desconocida';

    const nuevaDescarga = {
      delegacion: nombreDelegacion,
      mes: `${this.obtenerNombreMes(this.mesInicio)} - ${this.obtenerNombreMes(this.mesFinal)}`,
      archivos: this.resultados?.archivos || 0,
      tamanio: this.resultados?.tamanio || '0 KB',
      anio: this.anio,
      estado: 'pendiente',
      fecha_creacion: new Date()
    };

    // --- REINTEGRACIÓN DE LA BARRA ---
    this.progreso = 0;
    this.mostrarPopupConfirmacion = true;

    // Iniciamos la escucha del progreso vía WebSocket
    this.descargaService.iniciarDescarga(Number(this.delegacionSeleccionada)).subscribe({
      next: (evento) => {
        this.zone.run(() => { // NgZone asegura que la barra se mueva visualmente
          if (evento.tipo?.toUpperCase() === 'PROGRESO') {
            const valor = parseFloat(evento.progreso.toString().replace('%', ''));
            if (!isNaN(valor)) {
              this.progreso = Math.min(100, Math.max(0, valor));
              this.tiempoEstimado = this.calcularTiempoRestante(this.progreso);
            }
          }
        });
      },
      error: (err) => console.error('Error en WebSocket de progreso:', err)
    });

    // Registro paralelo en el historial
    this.apiService.registrarNuevaDescarga(nuevaDescarga).subscribe({
      next: (res) => console.log('Registro exitoso en historial'),
      error: (err) => console.warn('Error en registro de historial:', err)
    });
  }

  // --- FUNCIONES AUXILIARES ---

  calcularTiempoRestante(p: number): string {
    if (p >= 100) return 'Completado';
    const segundos = Math.round((100 - p) * 0.6); // Estimación simple
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
    this.progreso = 0;
  }

  obtenerNombreMes(id: any): string {
    const mes = this.meses.find(m => m.id == id);
    return mes ? mes.nombre : String(id);
  }



simularProgreso() {
  this.mostrarPopupConfirmacion = true; // Abrimos el modal
  this.progreso = 0; // Reiniciamos la barra
  this.tiempoEstimado = 'Calculando...';

  const intervalo = setInterval(() => {
    this.zone.run(() => {
      if (this.progreso < 100) {
        this.progreso += 10; // Sube de 10 en 10
        this.tiempoEstimado = this.calcularTiempoRestante(this.progreso);
      } else {
        clearInterval(intervalo); // Se detiene al llegar a 100
        console.log('Simulación completada con éxito');
      }
      this.cd.detectChanges(); // Forzamos a que Angular pinte el cambio
    });
  }, 500); // Se actualiza cada 500ms
}
}