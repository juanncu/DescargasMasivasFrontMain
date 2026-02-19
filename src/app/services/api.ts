import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  getHistorialDescargas() {
    throw new Error('Method not implemented.');
  }
  private http = inject(HttpClient);
  
  private apiUrl = 'http://172.20.23.41:5000'; 
  private apiUrlFiltros = 'http://172.20.23.41:5001';

  /** * SOLUCIÓN AL ERROR TS2339: 
   * Asegúrate de que el nombre sea EXACTAMENTE buscarFolios y que reciba 2 argumentos.
   */
  // En tu ApiService
// Actualizamos para recibir los parámetros booleanos y el id de descarga
buscarFolios(delegacion: number, filtros: any): Observable<any> {
  let params = new HttpParams()
    .set('delegacion', delegacion.toString())
    // Forzamos conversión a string de los booleanos
    .set('pdf', (!!filtros.pdf).toString())
    .set('xml', (!!filtros.xml).toString())
    .set('recibo', (!!filtros.recibo).toString())
    .set('idDescarga', filtros.idDescarga || '');

  // Agregamos el resto de filtros (anio, inicio, fin, padron, estado)
  Object.keys(filtros).forEach(key => {
    if (!['pdf', 'xml', 'recibo', 'idDescarga', 'delegacion'].includes(key)) {
      const valor = filtros[key];
      if (valor !== null && valor !== undefined && valor !== '') {
        params = params.append(key, valor.toString());
      }
    }
  });

  return this.http.get(`${this.apiUrl}/ObtenerTotalDeArchivos`, { params });
}
// Método para iniciar el proceso de descarga masiva
iniciarProcesoDescarga(delegacionId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });
}

  /** * SOLUCIÓN AL ERROR TS2339 en getListaArchivosDescarga
   */
  getListaArchivosDescarga(idDescarga: string, pagina: number): Observable<any> {
    const params = new HttpParams()
      .set('idDescarga', idDescarga)
      .set('pagina', pagina.toString());
    
    return this.http.get(`${this.apiUrlFiltros}/FiltroArchivos`, { params });
  }


  // --- Implementación de Descargas Reales ---
  descargarPdf(id: string | number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/DescargarPDF`, {
      params: { id: id.toString() },
      responseType: 'blob'
    });
  }

  descargarXml(id: string | number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/getReciboFile`, {
      params: { RECIBO_ID: id.toString() },
      responseType: 'blob'
    });
  }

  // --- Catálogos ---
  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerDelegaciones`);
  }

  getAniosFiscales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerAniosFiscales`);
  }

  getEstadosRecibo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerEstadosDeRecibos`);
  }

  getPadrones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerPadrones`);
  }
}