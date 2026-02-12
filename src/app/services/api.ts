import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosCFDI } from '../models/registro-descarga.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://172.20.23.41:5000'; 
  private apiUrlFiltros = 'http://172.20.23.41:5001';

  registrarNuevaDescarga(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cfdis/registrar`, datos);
  }

  getCfdis(idDelegacion: number): Observable<any> {
    const params = new HttpParams().set('delegacion_ids', idDelegacion.toString());
    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }

  /**
   * Llama al backend ObtenerTotalDeArchivos con filtros normalizados.
   * Backend espera: inicio y fin como números de mes (1-12), delegacion, padron, estado, anio.
   * Respuesta: { idDescaega, total } (o IdDescaega, Total).
   */
 buscarFolios(delegacion: number, filtros: any): Observable<any> {
  // Integramos los nuevos parámetros que pide el backend
  const f = { 
    ...filtros, 
    delegacion: Number(delegacion),
    // Mapeamos los checkboxes del HTML
    pdf: !!filtros.formatoPdf,       
    xml: !!filtros.formatoXml,       
    recibo: !!filtros.formatoRecibos, 
    idDescarga: filtros.idDescarga || `DESC_${Date.now()}` 
  };

  // Limpiamos nombres viejos que ya no usa el Swagger
  delete f.formatoPdf;
  delete f.formatoXml;
  delete f.formatoRecibos;

  return this.getCfdisConFiltros(f);
}
  /** Lista paginada de archivos de una descarga (backend: Peticiones/ObtenerlistaArchivosDescarga). */
  getListaArchivosDescarga(idDescarga: string, pagina: number): Observable<any> {
  const params = new HttpParams()
    .set('idDescarga', idDescarga)
    .set('pagina', pagina.toString());

  // CAMBIO: Usamos el puerto 5001 y la ruta /FiltroArchivos
  return this.http.get(`${this.apiUrlFiltros}/FiltroArchivos`, { params });
}

  /** Descarga PDF de un recibo por id (backend: DescargarPDF). */
  descargarPdf(id: string | number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/DescargarPDF`, {
      params: { id: String(id) },
      responseType: 'blob'
    });
  }

  /** Descarga XML de un recibo por id (backend: getReciboFile u equivalente). */
  descargarXml(id: string | number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/getReciboFile`, {
      params: { RECIBO_ID: String(id) },
      responseType: 'blob'
    });
  }

  getCfdisConFiltros(filtros: any): Observable<any> {
    const normalizado = this.normalizarFiltrosParaBackend(filtros);
    let params = new HttpParams();

    if (normalizado) {
      Object.keys(normalizado).forEach(key => {
        const valor = normalizado[key];
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/ObtenerTotalDeArchivos`, { params });
  }

  /**
   * Normaliza filtros para que el backend reciba siempre inicio y fin (números de mes 1-12).
   */
  private normalizarFiltrosParaBackend(filtros: any): Record<string, unknown> {
    if (!filtros) return {};
    const out: Record<string, unknown> = { ...filtros };

    // ini -> inicio (por si algo envía el nombre corto)
    if ('ini' in out && out['inicio'] == null) {
      out['inicio'] = out['ini'];
      delete out['ini'];
    }
    // fechaInicio (string "YYYY-MM-DD" o número) -> inicio (1-12)
    if (out['fechaInicio'] != null && out['inicio'] == null) {
      const v = out['fechaInicio'];
      out['inicio'] = typeof v === 'number' ? v : (parseInt(String(v).substring(5, 7), 10) || 1);
      delete out['fechaInicio'];
    }
    if (out['fechaFin'] != null && out['fin'] == null) {
      const v = out['fechaFin'];
      out['fin'] = typeof v === 'number' ? v : (parseInt(String(v).substring(5, 7), 10) || 1);
      delete out['fechaFin'];
    }

    // Asegurar que inicio y fin estén en rango 1-12 (el backend falla con 0)
    if (out['inicio'] != null) {
      const n = Number(out['inicio']);
      out['inicio'] = (n >= 1 && n <= 12) ? n : 1;
    }
    if (out['fin'] != null) {
      const n = Number(out['fin']);
      out['fin'] = (n >= 1 && n <= 12) ? n : 1;
    }

    return out;
  }

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerDelegaciones`);
  }

  /** Catálogo de estados de recibo (backend: ObtenerEstadosDeRecibos) */
  getEstadosRecibo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerEstadosDeRecibos`);
  }

  /** Catálogo de padrones (backend: ObtenerPadrones) */
  getPadrones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerPadrones`);
  }

  iniciarProcesoDescarga(delegacionId: number) {
    return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });
  
  }

    getAniosFiscales(): Observable<number[]> {
          return this.http.get<number[]>(`${this.apiUrl}/ObtenerAniosFiscales`);
  }

}

