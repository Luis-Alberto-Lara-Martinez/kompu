import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesProducto } from './detalles-producto';

describe('DetallesProducto', () => {
  let component: DetallesProducto;
  let fixture: ComponentFixture<DetallesProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
