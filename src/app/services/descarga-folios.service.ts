import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DescargaFoliosService {

  // 🔹 Esto lo dejas tal cual
  buscarFolios(delegacion: string, filtro: string) {
    return {
      archivos: 1500,
      tamanio: '1 GB',
      tiempo: '5 minutos'
    };
  }

  // (luego lo conectas al progreso)
  descargar(delegacion: string) {
    console.log('Descargando delegación:', delegacion);
  }

  // 
  iniciarDescarga(): Observable<any> {

    return new Observable(observer => {
      console.log('🟢 Observable iniciado');

      const folios = ['FOL-001', 'FOL-002', 'FOL-003'];
      const tiposArchivo = ['recibo.pdf', 'cfdi.pdf', 'cfdi.xml'];

      const totalArchivos = folios.length * tiposArchivo.length;
      let procesados = 0;

      let folioIndex = 0;
      let archivoIndex = 0;

      const intervalId = setInterval(() => {

        const folio = folios[folioIndex];
        const archivo = tiposArchivo[archivoIndex];

        const error = Math.random() > 0.8;

        // 📌 Evento de archivo (para el log)
        observer.next({
          tipo: 'ARCHIVO',
          folio: folio,
          archivo: archivo,
          estado: error ? 'ERROR' : 'OK',
          mensaje: error ? 'No se pudo generar el archivo' : undefined
        });

        procesados++;

        // 📊 Evento de progreso
        observer.next({
          tipo: 'PROGRESO',
          progreso: Math.round((procesados / totalArchivos) * 100)
        });

        archivoIndex++;

        if (archivoIndex === tiposArchivo.length) {
          archivoIndex = 0;
          folioIndex++;
        }

        if (folioIndex === folios.length) {
          clearInterval(intervalId);
          observer.complete();
        }

      }, 700);
    });
  }
}
