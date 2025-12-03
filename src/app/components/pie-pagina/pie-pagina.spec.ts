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

  it('debe mostrar el año actual', () => {
    const currentYear = new Date().getFullYear();
    expect(component.year).toBe(currentYear);
  });

  it('debe cambiar la imagen de Apple a negro en hover', () => {
    const img = document.createElement('img') as HTMLImageElement;
    img.src = 'assets/images/icons/apple-store-blanco.png';

    component.onAppleHover(img);

    expect(img.src).toContain('assets/images/icons/apple-store-negro.png');
  });

  it('debe cambiar la imagen de Apple a blanco en leave', () => {
    const img = document.createElement('img') as HTMLImageElement;
    img.src = 'assets/images/icons/apple-store-negro.png';

    component.onAppleLeave(img);

    expect(img.src).toContain('assets/images/icons/apple-store-blanco.png');
  });
});
