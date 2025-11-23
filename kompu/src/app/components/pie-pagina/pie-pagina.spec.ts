import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiePagina } from './pie-pagina';

describe('PiePagina', () => {
  let component: PiePagina;
  let fixture: ComponentFixture<PiePagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiePagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiePagina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
