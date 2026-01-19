import { Routes } from '@angular/router';
import { DescargaFoliosComponent } from './pages/descarga-folios/descarga-folios';
import { ProgresoDescargaComponent } from './pages/progreso-descarga/progreso-descarga.component';


export const routes: Routes = [

  { path: 'descarga-folios', component: DescargaFoliosComponent },
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  { path: 'progreso-descarga', component: ProgresoDescargaComponent },
  { path: 'main', component: DescargaFoliosComponent }
];