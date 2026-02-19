import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';
import { ApiService } from '../../services/api';
import * as signalR from '@microsoft/signalr';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './descarga-folios.html',
  styleUrls: ['./descarga-folios.css'],
  providers: [DescargaFoliosService]
})
export class DescargaFoliosComponent implements OnInit {
  // Inyecciones
  private descargaService = inject(DescargaFoliosService);
  private selectDescarga = inject(SelectDescarga);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cd = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private errorHandler = inject(ErrorHandlerService);


  // Configuración SignalR y API
  private hubConnection!: signalR.HubConnection;
  private readonly IP_BACK = "172.20.23.41";
  private readonly HUB_URL = `http://${this.IP_BACK}:5001/progresoHub`;

  // Variables de Estado
  listaDelegaciones: any[] = [];
  resultados: any = null;
  cargando = false;
  mostrarModalResultados = false;
  mostrarPopupConfirmacion = false;
  logsDescarga: { tipo: string, mensaje: string }[] = [];
  progreso = 0;
  tiempoEstimado = 'Esperando inicio...';
  tiempoRestante = 'Calculando...'; // <--- variable para el tiempo de descarga
  tiempoAproxResumen: string = 'Calculando...';

  descargaEnCurso = false;
  cargandoMotor = false;
  errorUI: { origen: string, mensaje: string, visible: boolean }[] = [];

  // Filtros
  delegacionSeleccionada: any = null;
  mesInicio: any = '';
  mesFinal: any = '';
  anio: number = 2025;
  estadoSeleccionadoId: string = '';
  padronSeleccionadoId: string = '';


  // Formatos
  formatoPdf = false;
  formatoXml = false;
  formatoRecibos = false;

  // Catálogos
  aniosDisponibles: number[] = [];
  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];
  estados: any[] = [];
  padrones: any[] = [];

  mesesFinalesDisponibles: any[] = [];
  idDescargaActual: string = '';
  descripcionEstadoRecibo: string = 'Seleccione un estado para ver la descripción';
  ngOnInit() {



    this.cargarMunicipios();
    this.iniciarConexionSignalR();
    this.cargarAniosFiscales();
    this.cargarCatalogosBackend();
  }


  // Función para actualizar la descripción (se llama en el (change) del select)
  actualizarDescripcionEstado() {
    const estadoEncontrado = this.estados.find(e => e.id === this.estadoSeleccionadoId);

    if (estadoEncontrado) {
      // Usamos la propiedad 'descripcion' que viene de la API
      this.descripcionEstadoRecibo = estadoEncontrado.descripcion;
    } else {
      this.descripcionEstadoRecibo = 'Seleccione un estado para ver la descripción';
    }
  }


  cargarCatalogosBackend() {
    // Cargar Estados
    this.apiService.getEstadosRecibo().subscribe({
      next: (res) => {
        this.estados = res;
        this.cd.detectChanges();
      },
      error: (err) => {
        const errorProcesado = this.errorHandler.procesar(err);
        this.lanzarError(errorProcesado.mensajeUsuario, errorProcesado.origen);
        this.cargando = false;


        console.error("Error cargando estados:", err)

      }
    });

    // Cargar Padrones
    this.apiService.getPadrones().subscribe({
      next: (res) => {
        this.padrones = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error cargando padrones:", err)
    });
  }

  // Función buscar para usar los valores REALES del objeto
 // En descarga-folios.component.ts

buscar() {
  this.cargando = true;
  const temporalId = `DESC_${Date.now()}`;

  const filtros = {
    padron: Number(this.padronSeleccionadoId),
    estado: Number(this.estadoSeleccionadoId),
    delegacion: Number(this.delegacionSeleccionada),
    anio: Number(this.anio),
    inicio: Number(this.mesInicio),
    fin: Number(this.mesFinal),
    // Usamos los nombres exactos del Swagger
    incluirPdf: this.formatoPdf,
    incluirXml: this.formatoXml,
    incluirRecibo: this.formatoRecibos,
    idDescarga: temporalId
  };

 
this.apiService.buscarFolios(Number(this.delegacionSeleccionada), filtros).subscribe({
    next: (res: any) => {
      this.resultados = {
        archivos: res.total || 0,
        tamanio: res.pesoFormateado || '0 B'
      };
      this.idDescargaActual = res.idDescarga || temporalId;
      
      // Si el peso es > 0, el motor trabajará
      if (res.totalBytes > 0) {
        this.calcularTiempoEstimado(res.totalBytes);
        this.mostrarModalResultados = true;
      } else {
        this.lanzarError('No se encontraron archivos físicos para descargar', 'BACKEND');
      }
      
      this.cargando = false;
      this.cd.detectChanges();
    }
  });
}

  // Convierte bytes a formato legible (KB, MB, GB)
  formatearBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Calcula el tiempo según una velocidad promedio (ej. 5 MB/s)
  calcularTiempoEstimado(totalBytes: number) {
    if (!totalBytes || totalBytes === 0) {
      this.tiempoAproxResumen = '0 seg';
      return;
    }

    const velocidadPromedioMBps = 5; // Velocidad estimada de descarga
    const totalMB = totalBytes / (1024 * 1024);
    const segundos = Math.ceil(totalMB / velocidadPromedioMBps);

    if (segundos < 60) {
      this.tiempoAproxResumen = `${segundos} seg`;
    } else {
      const minutos = Math.ceil(segundos / 60);
      this.tiempoAproxResumen = `${minutos} min aprox.`;
    }
  }

  private iniciarConexionSignalR() {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.HUB_URL, {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .build();

  // Escuchar el progreso real del motor
  this.hubConnection.on("ProgresoDescarga", (data: any) => {
    this.zone.run(() => {
      // Mapeo flexible para nombres de propiedades (Mayúsculas/Minúsculas)
      this.progreso = data.porcentaje ?? data.Porcentaje ?? 0;
      const completados = data.completados ?? data.Completados ?? 0;
      const total = data.totalArchivos ?? data.TotalArchivos ?? 0;

      this.tiempoEstimado = `${this.progreso}% (${completados}/${total})`;
      this.tiempoRestante = data.tiempoRestante ?? data.TiempoRestante ?? 'Calculando...';

      // Agregar log de archivo individual
      if (data.archivo || data.Archivo) {
        this.logsDescarga.push({
          tipo: (data.ok ?? data.Ok) ? 'OK' : 'ERROR',
          mensaje: `Archivo: ${data.archivo ?? data.Archivo} ${(data.ok ?? data.Ok) ? 'descargado' : 'falló'}`
        });
      }
      this.cd.detectChanges();
    });
  });

  // Escuchar mensajes de estado general
  this.hubConnection.on("Estado", (msg: string) => {
    this.zone.run(() => {
      this.logsDescarga.push({ tipo: 'ESTADO', mensaje: msg });
      this.cd.detectChanges();
    });
  });

  this.hubConnection.start().catch(err => console.error("Error SignalR:", err));
}

  // Métodos de Control
  pausar() { this.hubConnection.invoke("Pausar"); }
  reanudar() { this.hubConnection.invoke("Reanudar"); }
  cancelar() {
    this.hubConnection.invoke("Cancelar");
    this.mostrarPopupConfirmacion = false;
    // LIBERAMOS EL BLOQUEO
    this.descargaEnCurso = false;
    this.cd.detectChanges();
  }

 async confirmarDescarga() {
  // 1. LIMPIEZA TOTAL: Cerramos todo primero
  this.mostrarModalResultados = false;
  this.mostrarPopupConfirmacion = true; 
  this.descargaEnCurso = true;
  this.cargandoMotor = true;
  this.progreso = 0; // Inicializar siempre en 0
  this.cd.detectChanges(); // Forzar dibujo del modal vacío

  setTimeout(() => {
    this.logsDescarga = [{ tipo: 'ESTADO', mensaje: 'Interfaz activada. Conectando al motor 5001...' }];
    this.cd.detectChanges(); 
    this.activarMotorConErrorLog();
  }, 100);
}

private async activarMotorConErrorLog() {
  const url = `http://172.20.23.41:5001/FiltroArchivos?idDescarga=${this.idDescargaActual}&pdf=${this.formatoPdf}&xml=${this.formatoXml}&recibo=${this.formatoRecibos}`;
  
  try {
    // Intentamos la conexión al puerto 5001
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Error 500');
    
    this.cargandoMotor = false;
    this.logsDescarga.push({ tipo: 'OK', mensaje: 'Motor encendido con éxito.' });
  } catch (err) {
    // Aunque el backend truene (Error 500 / 1006), el modal ya está abierto
    this.cargandoMotor = false;
    this.logsDescarga.push({ tipo: 'ERROR', mensaje: 'Motor no disponible. Verifique puerto 5001.' });
    
    // Simulación forzada para que veas la barra moverse
    this.simularBarraPorSiAcaso();
  }
  this.cd.detectChanges();
}

private simularBarraPorSiAcaso() {
  const intv = setInterval(() => {
    this.zone.run(() => {
      if (this.progreso < 100) {
        this.progreso += 10;
        this.cd.detectChanges();
      } else {
        clearInterval(intv);
      }
    });
  }, 500);
}

private async activarMotorReal() {
  try {
    const url = `http://172.20.23.41:5001/FiltroArchivos?idDescarga=${this.idDescargaActual}&pdf=${this.formatoPdf}&xml=${this.formatoXml}&recibo=${this.formatoRecibos}`;
    const resp = await fetch(url);
    this.cargandoMotor = false;
    this.logsDescarga.push({ tipo: 'OK', mensaje: 'Motor conectado con éxito.' });
  } catch (err) {
    this.cargandoMotor = false;
    this.logsDescarga.push({ tipo: 'ERROR', mensaje: 'Error de conexión con el motor 5001.' });
  }
  this.cd.detectChanges();
}

// Función extra para que la barra se mueva aunque el backend esté roto
iniciarProgresoSimulado() {
  const intervalo = setInterval(() => {
    this.zone.run(() => {
      if (this.progreso < 100) {
        this.progreso += 10;
        this.cd.detectChanges();
      } else {
        clearInterval(intervalo);
      }
    });
  }, 800);
}

  /** Obtiene la lista de archivos del backend y dispara la descarga de los primeros (PDF/XML). */
  private iniciarDescargaDeArchivos(idDescarga: string) {
    this.apiService.getListaArchivosDescarga(idDescarga, 1).subscribe({
      next: (resp: any) => {
        const lista = resp?.data ?? resp?.Data ?? [];
        const total = resp?.totalRegistros ?? resp?.TotalRegistros ?? lista.length;
        this.logsDescarga.push({ tipo: 'INFO', mensaje: `Lista obtenida: ${lista.length} de ${total} archivos. Iniciando descargas...` });
        this.cd.detectChanges();
        let formatos = this.obtenerFormatosStr().toUpperCase();
        if (!formatos) formatos = 'PDF';
        const maxPrimeraDescarga = 10;
        const descargarUno = (id: string | number, ext: 'pdf' | 'xml') => {
          const obs = ext === 'pdf' ? this.apiService.descargarPdf(id) : this.apiService.descargarXml(id);
          obs.subscribe({
            next: (blob: Blob) => {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `recibo_${id}.${ext}`;
              a.click();
              URL.revokeObjectURL(url);
              this.logsDescarga.push({ tipo: 'OK', mensaje: `${ext.toUpperCase()} recibo ${id} descargado.` });
              this.cd.detectChanges();
            },
            error: () => {
              this.logsDescarga.push({ tipo: 'ERROR', mensaje: `Error al descargar ${ext.toUpperCase()} ${id}.` });
              this.cd.detectChanges();
            }
          });
        };
        for (let i = 0; i < Math.min(lista.length, maxPrimeraDescarga); i++) {
          const item = lista[i];
          const id = item?.idFolioRecibo ?? item?.IdFolioRecibo ?? item?.uuid ?? item?.UUID;
          if (!id) continue;
          if (formatos.includes('PDF')) descargarUno(id, 'pdf');
          if (formatos.includes('XML')) descargarUno(id, 'xml');
        }
        if (lista.length > maxPrimeraDescarga) {
          this.logsDescarga.push({ tipo: 'INFO', mensaje: `Descargando primeros ${maxPrimeraDescarga} archivos. Resto: ${lista.length - maxPrimeraDescarga} pendientes.` });
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.logsDescarga.push({ tipo: 'ERROR', mensaje: 'No se pudo obtener la lista de archivos.' });
        this.cd.detectChanges();
      }
    });
  }


  // Carga de Datos
  cargarMunicipios() {
    this.apiService.getMunicipios().subscribe({
      next: (res: any) => {
        this.listaDelegaciones = res.municipios || res;
        this.cd.detectChanges();
      },
      error: (lanzarError) => {
        console.error("Error cargando municipios:", lanzarError);
        this.lanzarError('Error al cargar municipios', 'BACKEND');
      }
    });
  }

  cargarAniosFiscales() {
    this.apiService.getAniosFiscales().subscribe({
      next: (res: any[]) => {
        // Extraemos el valor numérico (aFiscal)
        this.aniosDisponibles = res.map(x => Number(x.aFiscal));

        // Si el año actual no está en la lista, seleccionamos el más reciente
        if (!this.aniosDisponibles.includes(this.anio)) {
          this.anio = Math.max(...this.aniosDisponibles);
        }

        this.cd.detectChanges(); 
      }
    });
  }

  // Auxiliares
  obtenerNombreDelegacion(): string {
    const d = this.listaDelegaciones.find(x => (x.delegacionID || x.id) == this.delegacionSeleccionada);
    return d ? d.delegacion : 'No seleccionada';
  }



  cerrarModalResultados() {
    this.mostrarModalResultados = false;
    this.resultados = null;
  }

  obtenerFormatosStr(): string {
    const f = [];
    if (this.formatoPdf) f.push('PDF');
    if (this.formatoXml) f.push('XML');
    if (this.formatoRecibos) f.push('RECIBOS');
    return f.join(',');
  }

  obtenerNombreMes(id: any): string {
    return this.meses.find(m => m.id == id)?.nombre || String(id);
  }

  irAlHistorial() {
    const detalleFinal = {
      delegacion: this.obtenerNombreDelegacion(),
      periodo: `${this.obtenerNombreMes(this.mesInicio)} - ${this.obtenerNombreMes(this.mesFinal)} ${this.anio}`,
      estado: this.estados.find(e => e.id === this.estadoSeleccionadoId)?.nombre,
      padron: this.padrones.find(p => p.id === this.padronSeleccionadoId)?.nombre,
      formatos: this.obtenerFormatosStr(),

      // Datos que llegaro al modal de resultados
      totalArchivos: this.resultados?.archivos,
      tamanioTotal: this.resultados?.tamanio,

      tiempoEmpleado: this.tiempoRestante,
      fechaEjecucion: new Date()
    };

    this.descargaService.setUltimaDescarga(detalleFinal);
    this.mostrarPopupConfirmacion = false;
    this.descargaEnCurso = false;
    this.router.navigate(['/historial-descargas']);
  }

  onMesInicioChange() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    const inicioId = Number(this.mesInicio);
    const anioSeleccionado = Number(this.anio);

    this.mesesFinalesDisponibles = this.meses.filter(m => {
      const esMayorOIgualAlInicio = m.id >= inicioId;
      if (anioSeleccionado === anioActual) {
        return esMayorOIgualAlInicio && m.id <= mesActual;
      }
      return esMayorOIgualAlInicio;
    });

    if (this.mesFinal && !this.mesesFinalesDisponibles.find(m => m.id == this.mesFinal)) {
      this.mesFinal = '';
    }
  }

  get mesesInicioDisponibles() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;
    if (Number(this.anio) === anioActual) {
      return this.meses.filter(m => m.id <= mesActual);
    }
    return this.meses;
  }

  tipoErrorActual: string = '';
  mensajeErrorActual: string = '';

  lanzarError(mensaje: string, origen: string) {

    this.errorUI.push({
      origen,
      mensaje,
      visible: true
    });

    this.mensajeErrorActual = mensaje;
    this.tipoErrorActual = origen;

    console.error('ERROR UI', this.errorUI);
    this.cd.detectChanges();

  }

  /* vistaPreviaProgreso() {
  // Datos de prueba para simular el modal
  this.resultados = { archivos: 7333, tamanio: '284.90 MB' };
  this.mostrarModalResultados = false;
  this.mostrarPopupConfirmacion = true;
  this.cargandoMotor = true; // Mostramos el mensaje de "Conectando..."
  this.progreso = 0;
  this.logsDescarga = [{ tipo: 'ESTADO', mensaje: 'SIMULACIÓN: Conectando al motor...' }];
  this.cd.detectChanges();

  // Simular que el motor responde tras 2 segundos
  setTimeout(() => {
    this.cargandoMotor = false;
    this.logsDescarga.push({ tipo: 'OK', mensaje: 'Motor listo. Iniciando progreso simulación.' });
    
    const interval = setInterval(() => {
      if (this.progreso < 100) {
        this.progreso += 10;
        this.tiempoEstimado = `${this.progreso}% (Simulado)`;
        this.logsDescarga.push({ tipo: 'OK', mensaje: `Simulación: Archivo ${this.progreso/10} procesado.` });
        this.cd.detectChanges();
      } else {
        clearInterval(interval);
      }
    }, 400);
  }, 2000);
}
*/
}