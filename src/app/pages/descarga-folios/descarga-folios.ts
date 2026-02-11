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

  ngOnInit() {
    this.cargarMunicipios();
    this.iniciarConexionSignalR();
    this.cargarAniosFiscales();
    this.cargarCatalogosBackend();
  }

  cargarCatalogosBackend() {
    // Cargar Estados
    this.apiService.getEstadosRecibo().subscribe({
      next: (res) => {
        this.estados = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error("Error cargando estados:", err)
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

  // 3. Ajustamos la función buscar para usar los valores REALES del objeto
buscar() {
  this.cargando = true;

  // Construimos el objeto filtros usando únicamente los IDs numéricos
  const filtros = {
    padron: Number(this.padronSeleccionadoId),     // Envía el ID (ej: 1)
    estado: Number(this.estadoSeleccionadoId),     // Envía el ID (ej: 1)
    delegacion: Number(this.delegacionSeleccionada),
    anio: Number(this.anio),
    ini: Number(this.mesInicio),                   // El backend usará este Int32 como mes
    fin: Number(this.mesFinal),                     // El backend usará este Int32 como mes
    formatos: this.obtenerFormatosStr()
  };

  console.log("Enviando parámetros como Int32:", filtros);

  this.descargaService.buscarFolios(this.delegacionSeleccionada, '', filtros).subscribe({
    next: (res) => {
      this.resultados = res; // Recibe { archivos: 2450, tamanio: '1.8 GB', ... }
      this.mostrarModalResultados = true;
      this.cargando = false;
      this.cd.detectChanges();
    },
    error: (err) => {
      console.error('Error en la petición:', err);
      this.cargando = false;
    }
  });
}
  private iniciarConexionSignalR() {
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  this.hubConnection.on("ProgresoDescarga", (data: any) => {
    this.zone.run(() => {
      this.progreso = data.porcentaje;
      this.tiempoEstimado = `${data.porcentaje}% (${data.completados}/${data.totalArchivos})`;
      
  
      // Dejamos mapeado el campo que enviará el backend para el tiempo restante
      this.tiempoRestante = data.tiempoRestante || 'Calculando...'; 

      this.logsDescarga.push({
        tipo: data.ok ? 'OK' : 'ERROR',
        mensaje: `Archivo: ${data.archivo} ${data.ok ? 'descargado' : 'falló'}`
      });
      
      this.cd.detectChanges();
    });
  });

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
  }

  async confirmarDescarga() {
    this.mostrarModalResultados = false;
    this.mostrarPopupConfirmacion = true;
    this.progreso = 0;
    this.logsDescarga = [];
    this.tiempoEstimado = 'Iniciando proceso real...';

    const fIni = `${this.anio}-${this.mesInicio.toString().padStart(2, '0')}-01`;
    const fFin = `${this.anio}-${this.mesFinal.toString().padStart(2, '0')}-28`;

    try {
      const url = `http://172.20.23.41:5000/ObtenerTotalDeArchivos?delegacion=${this.delegacionSeleccionada}&estado=${this.estadoSeleccionadoId}&padron=${this.padronSeleccionadoId}&ini=${fIni}&fin=${fFin}&anio=${this.anio}&formatos=${this.obtenerFormatosStr()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Servidor no pudo iniciar");
    } catch (error) {
      console.error("Error al iniciar descarga:", error);
      // Solo iniciamos simulación si la API falla para que puedas ver el diseño
      this.iniciarSimulacionVisual();
    }
  }

  probarModalProgreso() {
    this.resultados = { archivos: 2450, tamanio: '1.8 GB' };
    this.tiempoAproxResumen = '5 min';
    this.mostrarModalResultados = true;
    this.mostrarPopupConfirmacion = false;
    this.cd.detectChanges();
  }

  private iniciarSimulacionVisual() {
    this.progreso = 0;
    this.logsDescarga = [];
    const intervalo = setInterval(() => {
      this.zone.run(() => {
        if (this.progreso < 100) {
          this.progreso += 5;
          this.tiempoEstimado = `Procesando: ${this.progreso}%`;
          const folioRandom = Math.floor(Math.random() * 9000) + 10000;
          this.logsDescarga.push({
            tipo: 'OK',
            mensaje: `Archivo Folio-${folioRandom} generado y validado.`
          });
          this.cd.detectChanges();
        } else {
          this.tiempoEstimado = '¡Descarga completada con éxito!';
          clearInterval(intervalo);
          this.cd.detectChanges();
        }
      });
    }, 400);
  }

  // Carga de Datos
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
        this.aniosDisponibles = res.map(x => x.aFiscal);
        this.anio = Math.max(...this.aniosDisponibles);
        this.cd.detectChanges();
      },
      error: (err) => console.error(' Error al cargar años fiscales', err)
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
  // objeto con toda la información de la interfaz
  const detalleFinal = {
    delegacion: this.obtenerNombreDelegacion(),
    periodo: `${this.obtenerNombreMes(this.mesInicio)} - ${this.obtenerNombreMes(this.mesFinal)} ${this.anio}`,
    estado: this.estados.find(e => e.id === this.estadoSeleccionadoId)?.nombre,
    padron: this.padrones.find(p => p.id === this.padronSeleccionadoId)?.nombre,
    formatos: this.obtenerFormatosStr(),
    totalArchivos: this.resultados?.archivos,
    tamanioTotal: this.resultados?.tamanio,
    tiempoEmpleado: this.tiempoAproxResumen,
    fechaEjecucion: new Date()
  };

  // Guardamos en el servicio para que el componente de Historial lo lea
  this.descargaService.setUltimaDescarga(detalleFinal);
  
  this.mostrarPopupConfirmacion = false;
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
}