import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HistorialDescargas } from './historial-descargas.component';

describe('HistorialDescargas', () => {
  let component: HistorialDescargas;
  let fixture: ComponentFixture<HistorialDescargas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HistorialDescargas, 
        RouterTestingModule 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialDescargas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});