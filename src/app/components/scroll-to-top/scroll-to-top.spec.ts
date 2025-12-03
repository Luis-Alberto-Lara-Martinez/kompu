import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ScrollToTop } from './scroll-to-top';

describe('ScrollToTop', () => {
  let component: ScrollToTop;
  let fixture: ComponentFixture<ScrollToTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollToTop]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScrollToTop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar esVisible en false', () => {
    expect(component.esVisible).toBe(false);
  });

  it('debe mostrar el botón cuando el scroll es mayor a 10', () => {
    // Mock de window.scrollY
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 100
    });

    component.manejoScroll();

    expect(component.esVisible).toBe(true);
  });

  it('debe ocultar el botón cuando el scroll es menor o igual a 10', () => {
    // Primero hacer visible el botón
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 100
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(true);

    // Luego reducir el scroll
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 5
    });
    component.manejoScroll();

    expect(component.esVisible).toBe(false);
  });

  it('debe ocultar el botón cuando el scroll es exactamente 10', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 10
    });

    component.manejoScroll();

    expect(component.esVisible).toBe(false);
  });

  it('debe mostrar el botón cuando el scroll es exactamente 11', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 11
    });

    component.manejoScroll();

    expect(component.esVisible).toBe(true);
  });

  it('debe llamar a window.scrollTo con comportamiento smooth', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => { });

    component.scrollToTop();

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('debe manejar múltiples cambios de scroll', () => {
    // Scroll inicial
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(false);

    // Scroll hacia abajo
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 200
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(true);

    // Scroll hacia arriba pero aún visible
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 50
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(true);

    // Scroll al tope
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 0
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(false);
  });

  it('debe manejar valores extremos de scroll', () => {
    // Scroll muy grande
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 99999
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(true);

    // Scroll negativo (aunque no debería ocurrir en navegadores reales)
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: -10
    });
    component.manejoScroll();
    expect(component.esVisible).toBe(false);
  });

  it('no debe lanzar error al llamar scrollToTop múltiples veces', () => {
    const scrollToSpy = vi.fn();
    vi.spyOn(window, 'scrollTo').mockImplementation(scrollToSpy);

    component.scrollToTop();
    component.scrollToTop();
    component.scrollToTop();

    expect(scrollToSpy).toHaveBeenCalledTimes(3);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
