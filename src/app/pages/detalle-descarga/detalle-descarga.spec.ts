import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDescarga } from './detalle-descarga';

describe('DetalleDescarga', () => {
  let component: DetalleDescarga;
  let fixture: ComponentFixture<DetalleDescarga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDescarga]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleDescarga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
