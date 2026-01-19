import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgresoDescarga } from './progreso-descarga';

describe('ProgresoDescarga', () => {
  let component: ProgresoDescarga;
  let fixture: ComponentFixture<ProgresoDescarga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoDescarga]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgresoDescarga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
