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

  registrarNuevaDescarga(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cfdis/registrar`, datos);
  }

  getCfdis(idDelegacion: number): Observable<any> {
    const params = new HttpParams().set('delegacion_ids', idDelegacion.toString());
    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }

  getCfdisConFiltros(filtros: any): Observable<any> {
    let params = new HttpParams();

    if (filtros) {
      // Recorremos todo para que traiga el objeto filtros
      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];

        // VALIDACIÓN:
        // Si el valor es 0, LO DEJA PASAR.
        // Solo ignora si es null, undefined o texto vacío.
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor.toString());
        }

      });
    }

    // se verá en consola exactamente qué se envía
    console.log('📡 Enviando a API:', params.toString());

    return this.http.get(`${this.apiUrl}/ObtenerTotalDeArchivos`, { params });
  }

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ObtenerDelegaciones`);
  }


  iniciarProcesoDescarga(delegacionId: number) {
    return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });

  }

  getAniosFiscales(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/ObtenerAniosFiscales`);
  }

  getEstadosRecibo() {
    return this.http.get<any[]>(`http://172.20.23.41:5000/ObtenerEstadosDeRecibos`);
  }

  getPadrones() {
    // Ajusta la URL según te indique el backend, usualmente es similar:
    return this.http.get<any[]>(`http://172.20.23.41:5000/ObtenerPadrones`);
  }
}
