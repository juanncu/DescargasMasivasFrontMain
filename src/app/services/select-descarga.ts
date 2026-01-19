import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SelectDescarga {
  delegacionSeleccionada: number | null = null;
  filtroSeleccionado: string = '';

  setDatos(delegacion: number, filtro: string) {
    this.delegacionSeleccionada = delegacion;
    this.filtroSeleccionado = filtro;
  }

  getDelegacion(): number | null {
    return this.delegacionSeleccionada;
  }
}
