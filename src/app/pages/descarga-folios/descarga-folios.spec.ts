import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // <--- Necesario para simular API
import { RouterTestingModule } from '@angular/router/testing'; // <--- Necesario para simular Router
import { MatIconModule } from '@angular/material/icon';

// 1. Importamos el nombre CORRECTO de la clase
import { DescargaFoliosComponent } from './descarga-folios';

describe('DescargaFoliosComponent', () => {
  let component: DescargaFoliosComponent;
  let fixture: ComponentFixture<DescargaFoliosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      
      imports: [
        DescargaFoliosComponent, 
        MatIconModule,
        HttpClientTestingModule, 
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescargaFoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});