import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgresoDescargaComponent } from './progreso-descarga.component';

describe('ProgresoDescarga', () => {
  let component: ProgresoDescargaComponent;
  let fixture: ComponentFixture<ProgresoDescargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoDescargaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgresoDescargaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
