import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaFolios } from './descarga-folios';

describe('DescargaFolios', () => {
  let component: DescargaFolios;
  let fixture: ComponentFixture<DescargaFolios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescargaFolios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescargaFolios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

