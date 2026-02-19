import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // BehaviorSubject guarda el estado booleano del sidebar
  private sidebarOpen = new BehaviorSubject<boolean>(false);
  
  // Observable que los componentes escucharán
  sidebarOpen$ = this.sidebarOpen.asObservable();

  toggleSidebar() {
    this.sidebarOpen.next(!this.sidebarOpen.value);
  }

  closeSidebar() {
    this.sidebarOpen.next(false);
  }
}