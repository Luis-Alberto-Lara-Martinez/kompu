import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { GestionUsuarios } from './gestion-usuarios';
import { Usuario } from '../../models/usuario';

const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'Juan',
    email: 'juan@mail.com',
    clave: 'hash123',
    telefono: '123456789',
    direccion: 'Calle 1',
    rol: 'usuario',
    estado: 'activado',
    carrito: [],
    listaDeseos: [],
  },
  {
    id: 2,
    nombre: 'Ana',
    email: 'ana@mail.com',
    clave: 'hash456',
    telefono: '987654321',
    direccion: 'Calle 2',
    rol: 'usuario',
    estado: 'desactivado',
    carrito: [],
    listaDeseos: [],
  },
  {
    id: 3,
    nombre: 'Admin',
    email: 'admin@mail.com',
    clave: 'hash789',
    telefono: '555555555',
    direccion: 'Calle Admin',
    rol: 'admin',
    estado: 'activado',
    carrito: [],
    listaDeseos: [],
  },
] as Usuario[];

describe('GestionUsuarios', () => {
  let component: GestionUsuarios;
  let fixture: ComponentFixture<GestionUsuarios>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionUsuarios],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionUsuarios);
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

  describe('ngOnInit comportamiento', () => {
    it('carga usuarios desde localStorage si existe (rol admin)', () => {
      const payloadAdmin = { id: 3, rol: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.usuarios).toHaveLength(3);
      expect(component.usuarios[0].nombre).toBe('Juan');
    });

    it('no carga usuarios si no hay listaUsuarios en localStorage', () => {
      const payloadAdmin = { id: 3, rol: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.removeItem('listaUsuarios');
      component.ngOnInit();
      expect(component.usuarios).toHaveLength(0);
    });

    it('mantiene el array vacío si listaUsuarios es null', () => {
      const payloadAdmin = { id: 3, rol: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.removeItem('listaUsuarios');
      component.usuarios = mockUsuarios.slice();
      component.ngOnInit();
      expect(component.usuarios).toHaveLength(3); // No se modifica si no hay datos
    });

    it('redirige a /home si no hay token', () => {
      localStorage.removeItem('token');
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('redirige a /home si el rol no es admin', () => {
      const payloadUsuario = { id: 1, rol: 'usuario', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadUsuario))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(component.usuarios).toHaveLength(0);
    });
  });

  describe('toggleEstado comportamiento', () => {
    beforeEach(() => {
      const payloadAdmin = { id: 3, rol: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
    });

    it('cambia estado de activado a desactivado', () => {
      const usuario = component.usuarios[0]; // Juan, activado
      expect(usuario.estado).toBe('activado');

      component.toggleEstado(usuario);

      const actualizado = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(actualizado[0].estado).toBe('desactivado');
      expect(component.usuarios[0].estado).toBe('desactivado');
    });

    it('cambia estado de desactivado a activado', () => {
      const usuario = component.usuarios[1]; // Ana, desactivado
      expect(usuario.estado).toBe('desactivado');

      component.toggleEstado(usuario);

      const actualizado = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(actualizado[1].estado).toBe('activado');
      expect(component.usuarios[1].estado).toBe('activado');
    });

    it('persiste cambios en localStorage correctamente', () => {
      const usuario = component.usuarios[2]; // Admin

      component.toggleEstado(usuario);

      const guardado = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(guardado).toHaveLength(3);
      expect(guardado[2].estado).toBe('desactivado');
    });

    it('no hace nada si listaUsuarios no existe en localStorage', () => {
      localStorage.removeItem('listaUsuarios');
      const usuario = component.usuarios[0];
      const estadoInicial = usuario.estado;

      component.toggleEstado(usuario);

      expect(usuario.estado).toBe(estadoInicial);
      expect(localStorage.getItem('listaUsuarios')).toBeNull();
    });

    it('no hace nada si el usuario no se encuentra en la lista', () => {
      const usuarioInexistente: Usuario = {
        id: 999,
        nombre: 'Inexistente',
        email: 'test@mail.com',
        clave: 'hash',
        telefono: '111111111',
        direccion: 'Calle Test',
        rol: 'usuario',
        estado: 'activado',
        carrito: [],
        listaDeseos: [],
      };

      component.toggleEstado(usuarioInexistente);

      const listaOriginal = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(listaOriginal).toEqual(mockUsuarios);
    });

    it('actualiza la referencia de usuarios después del toggle', () => {
      const usuario = component.usuarios[0];
      const listaAntes = component.usuarios;

      component.toggleEstado(usuario);

      const listaDespues = component.usuarios;
      expect(listaDespues).not.toBe(listaAntes); // Nueva referencia
      expect(listaDespues[0].estado).toBe('desactivado');
    });

    it('toggle múltiple vuelve al estado original', () => {
      const usuario = component.usuarios[0];
      const estadoOriginal = usuario.estado;

      component.toggleEstado(usuario);
      component.toggleEstado(component.usuarios[0]);

      expect(component.usuarios[0].estado).toBe(estadoOriginal);
    });
  });
});
