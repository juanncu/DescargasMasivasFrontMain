import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialDescargasComponent } from './historial-descargas.component';

describe('HistorialDescargas', () => {
  let component: HistorialDescargasComponent;
  let fixture: ComponentFixture<HistorialDescargasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialDescargasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialDescargasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
    
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
