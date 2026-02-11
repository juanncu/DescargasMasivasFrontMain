import { Routes } from '@angular/router';
import { DescargaFoliosComponent } from './pages/descarga-folios/descarga-folios';
import { ProgresoDescargaComponent } from './pages/progreso-descarga/progreso-descarga.component';
import { HistorialDescargas } from './pages/historial-descargas/historial-descargas.component';
import { DetalleDescarga } from './pages/detalle-descarga/detalle-descarga.component';

export const routes: Routes = [
  { path: '', redirectTo: 'descarga-folios', pathMatch: 'full' },
  { path: 'descarga-folios', component: DescargaFoliosComponent },
  { path: 'main', component: DescargaFoliosComponent },
  { path: 'progreso-descarga', component: ProgresoDescargaComponent },
  { path: 'historial-descargas', component: HistorialDescargas },
  { path: 'historial-descargas/:id', component: DetalleDescarga },
];