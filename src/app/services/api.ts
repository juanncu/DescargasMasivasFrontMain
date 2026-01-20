import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://172.20.23.44:8000';

  getCfdis(idDelegacion: number): Observable<any> {
    const params = new HttpParams().set('delegacion_ids', idDelegacion.toString());

    return this.http.get(`${this.apiUrl}/cfdis/`, { params });
  }
}
