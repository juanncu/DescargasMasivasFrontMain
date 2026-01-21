import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialDescargas } from './historial-descargas';

describe('HistorialDescargas', () => {
  let component: HistorialDescargas;
  let fixture: ComponentFixture<HistorialDescargas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialDescargas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialDescargas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
