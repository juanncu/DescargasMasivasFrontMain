import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core'; // Importamos NgZone
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatIconModule, MatProgressSpinnerModule],
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

  // -------------------------
  // LISTAS PARA SELECT (JSON)
  // -------------------------
  estados = [
    {
      id: '1',
      nombre: 'ACTIVO',
      estadoID: '1, 3, 4'
    },
    {
      id: '2',
      nombre: 'CANCELADO',
      estadoID: '2'
    },
    {
      id: '3',
      nombre: 'AMBOS',
      estadoID: '1, 2, 3, 4'
    }
  ];

  padrones = [
    {
      id: '1',
      nombre: 'TODOS',
      padronID: '1, 3, 4, 5, 6'
    },
    {
      id: '2',
      nombre: 'PREDIAL',
      padronID: '2'
    }
  ];

  // valores seleccionados del select
  estadoSeleccionadoId = null;
  padronSeleccionadoId = null;

  listaDelegaciones: any[] = [];
  resultados: any = { archivos: 0, tamanio: '0 KB' };
  cargando = false;
  mostrarPopupConfirmacion = false;
  mostrarModalResultados: boolean = false;

  formatoPdf: boolean = true;   // Marcado por defecto
  formatoXml: boolean = true;   // Marcado por defecto
  formatoRecibos: boolean = false;

  // Variables de progreso
  progreso = 0;
  tiempoEstimado = 'Calculando...'; // Corregido el nombre

  aniosDisponibles: number[] = [2026, 2025];

  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];

  ngOnInit() {
    this.cargarMunicipios();
    this.anio = 2026;
  }

  cargarMunicipios() {
  this.apiService.getMunicipios().subscribe({
    next: (respuesta: any) => {
      console.log("Respuesta de API:", respuesta); // Revisa esto en la consola F12
      
      if (respuesta && respuesta.municipios) {
        this.listaDelegaciones = respuesta.municipios;
      } else if (Array.isArray(respuesta)) {
        this.listaDelegaciones = respuesta;
      } else {
        console.warn("La API no devolvió un formato conocido", respuesta);
      }
      
      // Forzamos la actualización de la vista
      this.cd.markForCheck(); 
      this.cd.detectChanges();
    },
    error: (err) => console.error("Error cargando municipios:", err)
  });
}

  buscar() {
    // 1. Validaciones previas de UI
    if (!this.formatoPdf && !this.formatoXml && !this.formatoRecibos) {
      alert('Seleccione al menos un formato.');
      return;
    }

    // 2. Limpieza de IDs (Aseguramos que sean números reales)
    const idDelegacion = Number(this.delegacionSeleccionada);
    const anioSeleccionado = Number(this.anio);

    // PROTECCIÓN: Si idDelegacion es NaN, detenemos la ejecución
    if (isNaN(idDelegacion) || idDelegacion === 0) {
      alert('Error: Seleccione una delegación válida.');
      console.error('Valor de delegación no es válido:', this.delegacionSeleccionada);
      return;
    }

    // 3. Formateo de fechas (ini/fin)
    const mesIniStr = this.mesInicio.toString().padStart(2, '0');
    const ini = `${anioSeleccionado}-${mesIniStr}-01`;

    const ultimoDia = new Date(anioSeleccionado, Number(this.mesFinal), 0).getDate();
    const mesFinStr = this.mesFinal.toString().padStart(2, '0');
    const fin = `${anioSeleccionado}-${mesFinStr}-${ultimoDia}`;

    // 4. Mapeo de formatos
    const formatosArr = [];
    if (this.formatoPdf) formatosArr.push('PDF');
    if (this.formatoXml) formatosArr.push('XML');
    if (this.formatoRecibos) formatosArr.push('RECIBOS');

    // 5. Objeto de filtros LIMPIO (Sin campos null)
    const filtros = {
      delegacion: idDelegacion,
      estado: this.estadoSeleccionadoId ? Number(this.estadoSeleccionadoId) : 1,
      padron: this.padronSeleccionadoId ? Number(this.padronSeleccionadoId) : 1,
      ini: ini,
      fin: fin,
      anio: anioSeleccionado,
      formatos: formatosArr.join(',')
    };

    this.cargando = true;

    // 6. Llamada al servicio (Convertimos el ID a string para el parámetro de URL)
    this.descargaService.buscarFolios(idDelegacion.toString(), '', filtros)
      .subscribe({
        next: (res) => {
          this.resultados = res;
          this.mostrarModalResultados = true;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al buscar folios:', err);
          this.cargando = false;
          alert('Error en el servidor. Verifique los filtros seleccionados.');
        }
      });
  }

  cerrarModalResultados() {
    this.mostrarModalResultados = false;
    this.resultados = null; // Opcional: limpiar búsqueda si cancela
  }

  confirmarDescarga() {
    // 1. Cerrar modal de resultados
    this.mostrarModalResultados = false;

    // 2. Mapeo de nombres para etiquetas legibles
    const delegacionEncontrada = this.listaDelegaciones.find(
      d => (d.Id || d.id) == this.delegacionSeleccionada
    );
    const nombreDelegacion = delegacionEncontrada ? (delegacionEncontrada.Nombre || delegacionEncontrada.nombre) : 'Desconocida';

    // 3. Obtener etiquetas de formatos como Arreglo para los Badges
    const listaFormatos = [];
    if (this.formatoPdf) listaFormatos.push('PDF');
    if (this.formatoXml) listaFormatos.push('XML');
    if (this.formatoRecibos) listaFormatos.push('Recibos');

    // 4. Preparar el objeto para el historial
    const nuevaDescarga = {
      delegacion: nombreDelegacion,
      mesInicio: this.obtenerNombreMes(this.mesInicio), 
      mesFinal: this.obtenerNombreMes(this.mesFinal),   
      anio: this.anio,
      archivos: this.resultados?.archivos || 0,
      tamanio: this.resultados?.tamanio || '0 KB',
      formatos: listaFormatos, // Ahora es un array para el historial
      padron: this.padrones.find(p => p.id == this.padronSeleccionadoId)?.nombre || 'General',
      estadoFiltro: this.estados.find(e => e.id == this.estadoSeleccionadoId)?.nombre || 'Ambos',
      estatus: 'PENDIENTE', // Usamos estatus para el color del texto
      fecha_creacion: new Date()
    };

    // 5. Iniciar Barra de Progreso y WebSocket
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
      error: (err) => console.error('Error en WebSocket:', err)
    });

    // 6. Registro oficial en el historial
    this.apiService.registrarNuevaDescarga(nuevaDescarga).subscribe({
      next: () => console.log('Registro exitoso en historial'),
      error: (err) => console.warn('Error en registro:', err)
    });
  }




  modoVistaPrevia() {
    console.log('Iniciando vista previa (Modo Demo)');

    // 1. Forzamos datos de búsqueda ficticios
    this.resultados = {
      archivos: 2450,
      tamanio: '1.8 GB'
    };

    // 2. Si no hay delegación seleccionada, forzamos una para que el historial no truene
    if (!this.delegacionSeleccionada) {
      this.delegacionSeleccionada = '1'; // Campeche por defecto
    }

    // 3. Abrimos el modal de resumen directamente
    this.mostrarModalResultados = true;
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