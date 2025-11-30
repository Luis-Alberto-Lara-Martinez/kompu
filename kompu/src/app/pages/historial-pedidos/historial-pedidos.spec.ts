import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPedidos } from './historial-pedidos';

describe('HistorialPedidos', () => {
  let component: HistorialPedidos;
  let fixture: ComponentFixture<HistorialPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPedidos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
