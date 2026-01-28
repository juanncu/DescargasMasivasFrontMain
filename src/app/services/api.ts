import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FiltrosCFDI } from '../models/registro-descarga.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://172.20.23.41:8000'; 

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
      // Recorremos todas las llaves que traiga el objeto filtros
      Object.keys(filtros).forEach(key => {
        const valor = filtros[key];

        // VALIDACIÓN CRÍTICA:
        // Si el valor es 0, LO DEJA PASAR.
        // Solo ignora si es null, undefined o texto vacío.
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.append(key, valor.toString());
        }
      });
    }

    // Para depuración: se verá en consola exactamente qué se envía
    console.log('📡 Enviando a API:', params.toString());

    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cfdis/municipios`);
  }

  iniciarProcesoDescarga(delegacionId: number) {
    return this.http.post(`${this.apiUrl}/descargas/iniciar`, { delegacion: delegacionId });
  }
}