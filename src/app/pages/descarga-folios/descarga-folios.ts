import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DescargaFoliosService } from '../../services/descarga-folios.service';
import { SelectDescarga } from '../../services/select-descarga';

@Component({
  selector: 'app-descarga-folios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './descarga-folios.html',
  styleUrls: ['./descarga-folios.css'],
  providers: [DescargaFoliosService],
})
export class DescargaFoliosComponent {
  delegacionSeleccionada = '';
  filtroSeleccionado = '';
  resultados: any = null;
  cargando = false;
  progreso = 0;

  constructor(
    private descargaService: DescargaFoliosService,
    private selectDescarga: SelectDescarga,
    private router: Router,
  ) {}

  buscar() {
    if (!this.delegacionSeleccionada || !this.filtroSeleccionado) {
      alert('Seleccione delegación y filtro');
      return;
    }

    // 👇 Convertimos a número si viene como string
    const delegacionId = Number(this.delegacionSeleccionada);
    const buscar = true;

    this.resultados = this.descargaService.buscarFolios(
      this.delegacionSeleccionada,
      this.filtroSeleccionado,
    );
    console.log(this.delegacionSeleccionada);
    console.log(this.filtroSeleccionado);

    this.selectDescarga.setDatos(delegacionId, this.filtroSeleccionado);
  }

  confirmarDescarga() {
    console.log('CLICK CONFIRMAR');
    this.router.navigate(['/progreso-descarga']);
  }
}
