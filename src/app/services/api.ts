import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://172.20.23.41:5000'; 
  private apiUrlFiltros = 'http://172.20.23.41:5001';

  /** * SOLUCIÓN AL ERROR TS2339: 
   * Asegúrate de que el nombre sea EXACTAMENTE buscarFolios y que reciba 2 argumentos.
   */
  buscarFolios(delegacion: number, filtros: any): Observable<any> {
    let params = new HttpParams().set('delegacion', delegacion.toString());

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor.toString());
        }
      });
    }
    // EL RETURN ES OBLIGATORIO para que no salga el error de 'type void'
    return this.http.get(`${this.apiUrl}/ObtenerTotalDeArchivos`, { params });
  }

  /** * SOLUCIÓN AL ERROR TS2339 en getListaArchivosDescarga
   */
  getListaArchivosDescarga(idDescarga: string, pagina: number): Observable<any> {
    const params = new HttpParams()
      .set('idDescarga', idDescarga)
      .set('pagina', pagina.toString());
    
    return this.http.get(`${this.apiUrlFiltros}/FiltroArchivos`, { params });
  }

  /** * SOLUCIÓN AL ERROR TS2339 en iniciarProcesoDescarga
   */
  iniciarProcesoDescarga(delegacionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });
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