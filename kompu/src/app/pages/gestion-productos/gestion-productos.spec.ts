import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProductos } from './gestion-productos';

describe('GestionProductos', () => {
  let component: GestionProductos;
  let fixture: ComponentFixture<GestionProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
