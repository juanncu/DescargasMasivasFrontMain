import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  // Centralizamos la IP para evitar errores y facilitar cambios futuros
  private apiUrl = 'http://172.20.23.41:5000';

  /** * METODOS DE CATALOGOS 
   * Se cargan al iniciar el componente para llenar los selectores
   */

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerDelegaciones`);
  }

  getAniosFiscales(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/ObtenerAniosFiscales`);
  }

  getEstadosRecibo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerEstadosDeRecibos`);
  }

  getPadrones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerPadrones`);
  }

  /** * METODOS DE OPERACION 
   */

  // Este es el método que disparaba el error en tu componente
  // Ahora recibe la delegación y el objeto de filtros por separado.
  buscarFolios(idDelegacion: number, filtros: any): Observable<any> {
    let params = new HttpParams();

    // Agregamos la delegación base
    if (idDelegacion) {
      params = params.append('delegacion', idDelegacion.toString());
    }

    // Mapeamos el resto de los filtros (anio, ini, fin, estado, padron)
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        // Solo enviamos valores que no sean nulos o vacíos, pero permitimos el 0
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor.toString());
        }
      });
    }

    // Log para depuración en consola
    console.log('📡 Petición a:', `${this.apiUrl}/ObtenerTotalDeArchivos?${params.toString()}`);
    
    return this.http.get(`${this.apiUrl}/ObtenerTotalDeArchivos`, { params });
  }

  registrarNuevaDescarga(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cfdis/registrar`, datos);
  }

  iniciarProcesoDescarga(delegacionId: number): Observable<any> {
    // Nota: El motor real suele ser un GET al endpoint que dispara SignalR
    return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });
  }

  // Ejemplo de obtención simple de CFDI por delegación
  getCfdis(idDelegacion: number): Observable<any> {
    const params = new HttpParams().set('delegacion_ids', idDelegacion.toString());
    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }
}