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

@Injectable({
  providedIn: 'root',
})
export class SelectDescarga {
  private delegacionSubject = new BehaviorSubject<number | null>(null);

  delegacion$ = this.delegacionSubject.asObservable();

  setDelegacion(delegacion: number) {
    this.delegacionSubject.next(delegacion);
  }
}
