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
  private API_BASE = "http://localhost:5001"; // IP del equipo de Back

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
      .withUrl(`${this.API_BASE}/progresoHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on("ProgresoDescarga", (data: any) => {
      this.zone.run(() => {
        // Mapeo de datos del Back al diseño SAFIN
        this.progreso = data.porcentaje;
        this.tiempoEstimado = `${data.completados} de ${data.totalArchivos} archivos procesados`;

        this.logsDescarga.push({
          tipo: data.ok ? 'OK' : 'ERROR',
          mensaje: `Archivo: ${data.archivo} ${data.ok ? 'descargado' : 'falló'}`
        });

        this.cd.detectChanges();
      });
    });

    this.hubConnection.start()
      .then(() => console.log("✅ Conectado a SignalR Hub"))
      .catch(err => console.error("❌ Error de conexión SignalR:", err));
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
    if (!this.formatoPdf && !this.formatoXml && !this.formatoRecibos) {
      alert('Seleccione al menos un formato.');
      return;
    }

    const idDelegacion = Number(this.delegacionSeleccionada);
    if (isNaN(idDelegacion)) {
      alert('Seleccione una delegación válida.');
      return;
    }

    const filtros = {
      delegacion: idDelegacion,
      estado: Number(this.estadoSeleccionadoId),
      padron: Number(this.padronSeleccionadoId),
      ini: `${this.anio}-${this.mesInicio.toString().padStart(2, '0')}-01`,
      fin: `${this.anio}-${this.mesFinal.toString().padStart(2, '0')}-28`, // Ajustar último día dinámico si es necesario
      anio: this.anio,
      formatos: this.obtenerFormatosStr()
    };

    this.cargando = true;
    this.descargaService.buscarFolios(idDelegacion.toString(), '', filtros).subscribe({
      next: (res) => {
        this.resultados = res;
        this.mostrarModalResultados = true;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        alert('Error al buscar folios en el servidor.');
      }
    });
  }

  async confirmarDescarga() {
    this.mostrarModalResultados = false;
    this.logsDescarga = [];
    this.progreso = 0;
    this.mostrarPopupConfirmacion = true;

    try {
      // Endpoint del equipo de Back para disparar el proceso
      const url = `${this.API_BASE}/pdf?idDescarga=${this.delegacionSeleccionada}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Error iniciando descarga");

      // Registro en historial paralelo
      this.registrarEnHistorial();

    } catch (error) {
      console.error(error);
      this.mostrarPopupConfirmacion = false;
      alert("❌ No se pudo iniciar la descarga en el servidor.");
    }
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