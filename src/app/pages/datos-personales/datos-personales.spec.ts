import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { DatosPersonales } from './datos-personales';
import { Usuario } from '../../models/usuario';

const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'Usuario Test',
    email: 'test@mail.com',
    clave: 'hash123',
    telefono: '123456789',
    direccion: 'Calle Test',
    rol: 'usuario',
    estado: 'activado',
    carrito: [],
    listaDeseos: [],
  },
  {
    id: 2,
    nombre: 'Otro Usuario',
    email: 'otro@mail.com',
    clave: 'hash456',
    telefono: '987654321',
    direccion: 'Calle 2',
    rol: 'usuario',
    estado: 'activado',
    carrito: [],
    listaDeseos: [],
  },
];

describe('DatosPersonales', () => {
  let component: DatosPersonales;
  let fixture: ComponentFixture<DatosPersonales>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosPersonales],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DatosPersonales);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  describe('ngOnInit y obtenerDatosUsuario', () => {
    it('no asigna datos si no hay token', () => {
      localStorage.removeItem('token');
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.nombre).toBe('');
      expect(component.email).toBe('');
    });

    it('no asigna datos si payload inválido', () => {
      localStorage.setItem('token', 'h.' + btoa(JSON.stringify({})) + '.s');
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.nombre).toBe('');
    });

    it('no asigna datos si no hay listaUsuarios', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.removeItem('listaUsuarios');
      component.ngOnInit();
      expect(component.nombre).toBe('');
    });

    it('no asigna datos si usuario no existe', () => {
      const payload = { id: 999, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.nombre).toBe('');
    });

    it('asigna datos correctamente del usuario actual', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.nombre).toBe('Usuario Test');
      expect(component.email).toBe('test@mail.com');
      expect(component.clave).toBe('hash123');
      expect(component.telefono).toBe('123456789');
      expect(component.direccion).toBe('Calle Test');
    });
  });
});
