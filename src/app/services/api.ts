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

  getCfdis(idDelegacion: number): Observable<any> {
    const params = new HttpParams().set('delegacion_ids', idDelegacion.toString());

    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }

  getCfdisConFiltros(filtros: FiltrosCFDI): Observable<any> {
    let params = new HttpParams();

    if (filtros.padron) {
      params = params.set('padron', filtros.padron);
    }
    if (filtros.fechaInicio) {
      params = params.set('ini', filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      params = params.set('fin', filtros.fechaFin);
    }
    if (filtros.delegacion) {
      params = params.set('delegacion', filtros.delegacion.toString());
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }

  getMunicipios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cfdis/municipios`);
  }
}
