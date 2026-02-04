// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class SelectDescarga {
//   delegacionSeleccionada: number | null = null;
//   filtroSeleccionado: string = '';

//   setDatos(delegacion: number, filtro: string) {
//     this.delegacionSeleccionada = delegacion;
//     this.filtroSeleccionado = filtro;
//   }

//   getDelegacion(): number | null {
//     return this.delegacionSeleccionada;
//   }
// }

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FiltrosCFDI } from '../models/registro-descarga.model';

@Injectable({
  providedIn: 'root',
})
export class SelectDescarga {
  private filtrosSubject = new BehaviorSubject<FiltrosCFDI>({
  fechaInicio: null,
  fechaFin: null,
  delegacion: null,
  estado: null,
  anio: 2026,           
  padron: null,        
  estadoFiltro: 'Ambos', 
  formatos: ''         
});

  filtros$ = this.filtrosSubject.asObservable();

  setFiltros(filtros: Partial<FiltrosCFDI>) {
    const actual = this.filtrosSubject.value;
    this.filtrosSubject.next({ ...actual, ...filtros });
  }
}
