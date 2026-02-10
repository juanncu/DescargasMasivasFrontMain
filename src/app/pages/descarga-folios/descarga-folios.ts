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
import { error } from 'console';

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

  // Configuración SignalR y API
  private hubConnection!: signalR.HubConnection;
 private readonly IP_BACK = "172.20.23.41";
  private readonly HUB_URL = `http://${this.IP_BACK}:5001/progresoHub`;
private readonly API_URL = `http://${this.IP_BACK}:5000/pdf`;

  // Variables de Estado
  listaDelegaciones: any[] = [];
  resultados: any = null;
  cargando = false;
  mostrarModalResultados = false;
  mostrarPopupConfirmacion = false;
  logsDescarga: { tipo: string, mensaje: string }[] = [];

  // Filtros
  delegacionSeleccionada: any = null;
  mesInicio = '';
  mesFinal = '';
  anio: number = 2025; // Por defecto según requerimiento
  estadoSeleccionadoId: string = '3';
  padronSeleccionadoId: string = '1';

  // Formatos
  formatoPdf = true;
  formatoXml = true;
  formatoRecibos = false;

  // Progreso
  progreso = 0;
  tiempoEstimado = 'Esperando inicio...';

  // Catálogos
  aniosDisponibles: number[] = [];
  meses = [
    { id: 1, nombre: 'Enero' }, { id: 2, nombre: 'Febrero' }, { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' }, { id: 5, nombre: 'Mayo' }, { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' }, { id: 8, nombre: 'Agosto' }, { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' }, { id: 11, nombre: 'Noviembre' }, { id: 12, nombre: 'Diciembre' }
  ];
  estados = [
    { id: '1', nombre: 'ACTIVO' },
    { id: '2', nombre: 'CANCELADO' },
    { id: '3', nombre: 'AMBOS' }
  ];
  padrones = [
    { id: '1', nombre: 'TODOS' },
    { id: '2', nombre: 'PREDIAL' }
  ];

  mesesFinalesDisponibles: any[] = [];



  ngOnInit() {
    this.cargarMunicipios();
    this.iniciarConexionSignalR();
    this.cargarAniosFiscales();
  }

  private iniciarConexionSignalR() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Listener: Progreso de Descarga
    this.hubConnection.on("ProgresoDescarga", (data: any) => {
      this.zone.run(() => {
        this.progreso = data.porcentaje;
        this.tiempoEstimado = `${data.porcentaje}% (${data.completados}/${data.totalArchivos})`;

        this.logsDescarga.push({
          tipo: data.ok ? 'OK' : 'ERROR',
          mensaje: `Archivo: ${data.archivo} ${data.ok ? 'descargado' : 'falló'}`
        });
      });
    });

    // Listener: Estado General
    this.hubConnection.on("Estado", (msg: string) => {
      this.zone.run(() => {
        this.logsDescarga.push({ tipo: 'ESTADO', mensaje: msg });
      });
    });

    this.hubConnection.start().catch(err => console.error("Error SignalR:", err));
  }

  // Métodos de Control vinculados a los botones del backend
  pausar() { this.hubConnection.invoke("Pausar"); }
  reanudar() { this.hubConnection.invoke("Reanudar"); }
  cancelar() {
    this.hubConnection.invoke("Cancelar");
    this.mostrarPopupConfirmacion = false;
  }

  async confirmarDescarga() {
  this.mostrarModalResultados = false;
  this.mostrarPopupConfirmacion = true;
  this.progreso = 0;
  this.logsDescarga = [];

  const fIni = `${this.anio}-${this.mesInicio.toString().padStart(2, '0')}-01`;
  const fFin = `${this.anio}-${this.mesFinal.toString().padStart(2, '0')}-28`;

  try {
    // Usamos la IP correcta 172.20.23.41 y los parámetros corregidos
    const url = `http://172.20.23.41:5000/ObtenerTotalDeArchivos?delegacion=${this.delegacionSeleccionada}&estado=${this.estadoSeleccionadoId}&padron=${this.padronSeleccionadoId}&ini=${fIni}&fin=${fFin}&anio=${this.anio}&formatos=${this.obtenerFormatosStr()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Servidor no pudo iniciar");
  } catch (error) {
    console.error("Error al iniciar descarga:", error);
    this.mostrarPopupConfirmacion = false;
    alert("Error de conexión con el motor de descarga.");
  }
}


  // En descarga-folios.component.ts

  probarModalProgreso() {
    // 1. Preparamos el estado inicial del modal
    this.mostrarPopupConfirmacion = true;
    this.progreso = 0;
    this.logsDescarga = [];
    this.tiempoEstimado = 'Iniciando simulación...';

    // 2. Simulamos la llegada de mensajes del servidor
    const intervalo = setInterval(() => {
      this.zone.run(() => {
        if (this.progreso < 100) {
          this.progreso += 10;
          this.tiempoEstimado = `Procesando... ${this.progreso / 10} de 10 archivos`;

          // Añadimos un log simulado
          const esError = this.progreso === 50; // Simulamos un error a la mitad
          this.logsDescarga.push({
            tipo: esError ? 'ERROR' : 'OK',
            mensaje: `Folio ${12340 + this.progreso} - Archivo generado con éxito`
          });

          // Si hay error, añadimos un mensaje extra en rojo
          if (esError) {
            this.logsDescarga.push({
              tipo: 'ERROR',
              mensaje: `Folio 12375 - Error en conexión de red`
            });
          }
        } else {
          this.tiempoEstimado = '¡Descarga simulada completada!';
          clearInterval(intervalo);
        }
        this.cd.detectChanges();
      });
    }, 800); // Se actualiza cada 0.8 segundos
  }


  cargarMunicipios() {
    this.apiService.getMunicipios().subscribe({
      next: (res: any) => {
        this.listaDelegaciones = res.municipios || res;
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error cargando municipios:", err)
    });
  }


  cargarAniosFiscales() {
    this.apiService.getAniosFiscales().subscribe({
      next: (res: any[]) => {

        // Objetos del backend { aFiscal: number }
        this.aniosDisponibles = res.map(x => x.aFiscal);

        // Selecciona automáticamente el año más reciente
        this.anio = Math.max(...this.aniosDisponibles);

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(' Error al cargar años fiscales', err);
      }
    });
  }
  buscar() {
  this.cargando = true;

  // Creamos el formato YYYY-MM-DD que el backend espera
  const fechaInicio = `${this.anio}-${this.mesInicio.toString().padStart(2, '0')}-01`;
  const fechaFin = `${this.anio}-${this.mesFinal.toString().padStart(2, '0')}-28`; // Usamos 28 para evitar errores de días del mes

  const filtros = {
    padron: Number(this.padronSeleccionadoId),
    estado: Number(this.estadoSeleccionadoId),
    delegacion: Number(this.delegacionSeleccionada),
    anio: this.anio,
    ini: fechaInicio, // Enviamos fecha real, no solo el ID del mes
    fin: fechaFin
  };

  console.log("Enviando a API con fechas corregidas:", filtros);

  this.descargaService.buscarFolios(this.delegacionSeleccionada, '', filtros).subscribe({
    next: (res) => {
      this.resultados = res;
      this.mostrarModalResultados = true;
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error en búsqueda real:', err);
      this.cargando = false;
      alert('Error en el servidor. Verifica los rangos de fechas.');
    }
  });
}
  // 3. Lógica de la barra y consola negra
  iniciarSimulacionProgreso() {
    this.progreso = 0;
    this.logsDescarga = [];
    this.tiempoEstimado = 'Iniciando transferencia segura...';

    const intervalo = setInterval(() => {
      this.zone.run(() => {
        if (this.progreso < 100) {
          this.progreso += 10;
          this.tiempoEstimado = `Procesando: ${this.progreso / 10} de 10 archivos`;

          // Logs verdes estilo terminal
          this.logsDescarga.push({
            tipo: 'OK',
            mensaje: `Folio ${12340 + (this.progreso / 10)} - Archivo validado y descargado`
          });
        } else {
          this.tiempoEstimado = '¡Descarga completada!';
          clearInterval(intervalo);
        }
        this.cd.detectChanges();
      });
    }, 600);
  }

  obtenerNombreDelegacion(): string {
    const d = this.listaDelegaciones.find(x => (x.delegacionID || x.id) == this.delegacionSeleccionada);
    return d ? d.delegacion : 'No seleccionada';
  }

  private registrarEnHistorial() {
    const d = this.listaDelegaciones.find(x => (x.delegacionID || x.id) == this.delegacionSeleccionada);
    const nuevaDescarga = {
      delegacion: d?.delegacion || 'Desconocida',
      mesInicio: this.obtenerNombreMes(this.mesInicio),
      mesFinal: this.obtenerNombreMes(this.mesFinal),
      anio: this.anio,
      archivos: this.resultados?.archivos || 0,
      tamanio: this.resultados?.tamanio || '0 KB',
      formatos: this.obtenerFormatosStr().split(','),
      padron: this.padrones.find(p => p.id == this.padronSeleccionadoId)?.nombre || 'General',
      estadoFiltro: this.estados.find(e => e.id == this.estadoSeleccionadoId)?.nombre || 'Ambos',
      estado: 'pendiente',
      fecha_creacion: new Date()
    };

    this.apiService.registrarNuevaDescarga(nuevaDescarga).subscribe();
  }

  // descarga-folios.component.ts

  cerrarModalResultados() {
    this.mostrarModalResultados = false;
    // Opcionalmente puedes limpiar los resultados previos
    this.resultados = null;
  }

  // Auxiliares
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
    this.mostrarPopupConfirmacion = false;
    this.router.navigate(['/historial-descargas']);
  }

  reiniciarFiltros() {
    this.mostrarPopupConfirmacion = false;
    this.resultados = null;
    this.delegacionSeleccionada = null;
  }


  // Función que se dispara cuando cambia el Mes Inicio
  // En descarga-folios.component.ts

  onMesInicioChange() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1; // getMonth() es 0-11
    const inicioId = Number(this.mesInicio);
    const anioSeleccionado = Number(this.anio);

    // 1. Filtrar meses finales basados en el inicio y el tiempo real
    this.mesesFinalesDisponibles = this.meses.filter(m => {
      const esMayorOIgualAlInicio = m.id >= inicioId;

      // Si es el año actual (2026), no puede ser mayor al mes actual
      if (anioSeleccionado === anioActual) {
        return esMayorOIgualAlInicio && m.id <= mesActual;
      }

      // Si es un año pasado (2025), puede elegir cualquier mes posterior al inicio
      return esMayorOIgualAlInicio;
    });

    // 2. Resetear mes final si queda fuera de rango
    if (this.mesFinal && !this.mesesFinalesDisponibles.find(m => m.id == this.mesFinal)) {
      this.mesFinal = '';
    }
  }

  // También debemos filtrar el primer selector (Mes Inicio) según el año
  get mesesInicioDisponibles() {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    if (Number(this.anio) === anioActual) {
      return this.meses.filter(m => m.id <= mesActual);
    }
    return this.meses;
  }
}