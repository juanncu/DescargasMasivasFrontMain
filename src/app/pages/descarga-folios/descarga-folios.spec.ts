import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaFolios } from './descarga-folios';
import { MatIcon } from '@angular/material/icon';

describe('DescargaFolios', () => {
  let component: DescargaFolios;
  let fixture: ComponentFixture<DescargaFolios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescargaFolios, MatIcon]
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

