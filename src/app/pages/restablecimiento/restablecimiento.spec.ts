import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Restablecimiento } from './restablecimiento';

describe('Restablecimiento', () => {
  let component: Restablecimiento;
  let fixture: ComponentFixture<Restablecimiento>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Restablecimiento],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Restablecimiento);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('redirige a /login si no hay token', () => {
      activatedRoute.snapshot.queryParams = {};

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('redirige a /login si el token es inválido', () => {
      activatedRoute.snapshot.queryParams = { tokenR: 'token-invalido' };

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('redirige a /login si el token está expirado', () => {
      const payload = { email: 'test@mail.com', exp: Math.floor(Date.now() / 1000) - 60 };
      const token = `h.${btoa(JSON.stringify(payload))}.s`;
      activatedRoute.snapshot.queryParams = { tokenR: token };

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('establece el email si el token es válido', () => {
      const payload = { email: 'test@mail.com', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = `h.${btoa(JSON.stringify(payload))}.s`;
      activatedRoute.snapshot.queryParams = { tokenR: token };

      component.ngOnInit();

      expect(component.email).toBe('test@mail.com');
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('crearNuevaClave', () => {
    beforeEach(() => {
      component.email = 'test@mail.com';
    });

    it('muestra error si los campos están vacíos', () => {
      component.nuevaClave = '';
      component.confirmarNuevaClave = '';

      component.crearNuevaClave();

      expect(component.error).toBe('Por favor, completa ambos campos');
    });

    it('muestra error si las contraseñas no coinciden', () => {
      component.nuevaClave = 'Pass123!';
      component.confirmarNuevaClave = 'Pass456!';

      component.crearNuevaClave();

      expect(component.error).toBe('Las contraseñas no coinciden');
    });

    it('muestra error si la contraseña no cumple el formato', () => {
      component.nuevaClave = 'weak';
      component.confirmarNuevaClave = 'weak';

      component.crearNuevaClave();

      expect(component.error).toContain('debe tener al menos 6 caracteres');
    });

    it('actualiza la contraseña y navega a /login si todo es correcto', async () => {
      vi.useFakeTimers();
      const usuario = { id: 1, email: 'test@mail.com', clave: btoa('oldpass'), estado: 'activado' };
      localStorage.setItem('listaUsuarios', JSON.stringify([usuario]));

      component.nuevaClave = 'NewPass123!';
      component.confirmarNuevaClave = 'NewPass123!';

      component.crearNuevaClave();
      expect(component.cargando).toBe(true);

      vi.advanceTimersByTime(2100);

      const listaActualizada = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(listaActualizada[0].clave).toBe(btoa('NewPass123!'));
      expect(component.cargando).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      vi.useRealTimers();
    });

    it('maneja el caso cuando no existe listaUsuarios en localStorage', async () => {
      vi.useFakeTimers();
      localStorage.removeItem('listaUsuarios');

      component.nuevaClave = 'NewPass123!';
      component.confirmarNuevaClave = 'NewPass123!';

      component.crearNuevaClave();

      vi.advanceTimersByTime(2100);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      vi.useRealTimers();
    });

    it('no actualiza la contraseña si el usuario no existe', async () => {
      vi.useFakeTimers();
      const usuario = { id: 1, email: 'otro@mail.com', clave: btoa('oldpass'), estado: 'activado' };
      localStorage.setItem('listaUsuarios', JSON.stringify([usuario]));

      component.nuevaClave = 'NewPass123!';
      component.confirmarNuevaClave = 'NewPass123!';

      component.crearNuevaClave();

      vi.advanceTimersByTime(2100);

      const listaActualizada = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(listaActualizada[0].clave).toBe(btoa('oldpass'));
      expect(router.navigate).toHaveBeenCalledWith(['/login']);

      vi.useRealTimers();
    });
  });
});
