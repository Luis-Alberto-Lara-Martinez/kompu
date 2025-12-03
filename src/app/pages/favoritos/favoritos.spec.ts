import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { Favoritos } from './favoritos';
import { Usuario } from '../../models/usuario';
import { Producto } from '../../models/producto';

const mockProductos: Producto[] = [
  {
    id: 1,
    nombre: 'Teclado Mecánico',
    marca: 'Logitech',
    categoria: 'Periféricos',
    precio: 75,
    stock: 10,
    listaImagenes: ['teclado.jpg'],
    descripcion: 'Teclado RGB',
    valoraciones: [],
    fechaLanzamiento: new Date('2024-01-01'),
  },
  {
    id: 2,
    nombre: 'Ratón Gamer',
    marca: 'Razer',
    categoria: 'Periféricos',
    precio: 45,
    stock: 20,
    listaImagenes: ['raton.jpg'],
    descripcion: 'Ratón óptico',
    valoraciones: [],
    fechaLanzamiento: new Date('2024-02-01'),
  },
  {
    id: 3,
    nombre: 'Monitor 4K',
    marca: 'Dell',
    categoria: 'Monitores',
    precio: 400,
    stock: 5,
    listaImagenes: ['monitor.jpg'],
    descripcion: 'Monitor Ultra HD',
    valoraciones: [],
    fechaLanzamiento: new Date('2024-03-01'),
  },
] as Producto[];

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
    listaDeseos: [1, 3], // Teclado y Monitor
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
    listaDeseos: [2],
  },
] as Usuario[];

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favoritos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Favoritos);
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
    it('no carga favoritos si no hay token', () => {
      localStorage.removeItem('token');
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(0);
    });

    it('no carga favoritos si no hay listaUsuarios', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.removeItem('listaUsuarios');
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(0);
    });

    it('no carga favoritos si usuario no existe', () => {
      const payload = { id: 999, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(0);
    });

    it('no carga favoritos si no hay listaProductos', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      localStorage.removeItem('listaProductos');

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(0);
    });

    it('carga favoritos del usuario correctamente', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(2);
      expect(component.favoritos[0].nombre).toBe('Teclado Mecánico');
      expect(component.favoritos[1].nombre).toBe('Monitor 4K');
    });

    it('carga solo los productos que existen en listaProductos', () => {
      const usuariosConIdInexistente = [{
        ...mockUsuarios[0],
        listaDeseos: [1, 999, 3], // 999 no existe
      }];

      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(usuariosConIdInexistente));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(2); // Solo 1 y 3
      expect(component.favoritos.every(p => [1, 3].includes(p.id))).toBe(true);
    });

    it('maneja usuario sin favoritos', () => {
      const usuariosSinFavoritos = [{
        ...mockUsuarios[0],
        listaDeseos: [],
      }];

      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(usuariosSinFavoritos));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      component.ngOnInit();
      expect(component.favoritos).toHaveLength(0);
    });
  });

  describe('eliminarFavorito comportamiento', () => {
    beforeEach(() => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('elimina favorito del array local', () => {
      expect(component.favoritos).toHaveLength(2);

      component.eliminarFavorito(1);

      expect(component.favoritos).toHaveLength(1);
      expect(component.favoritos[0].id).toBe(3);
    });

    it('elimina favorito de listaDeseos en localStorage', () => {
      component.eliminarFavorito(1);

      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      const usuario = usuarios.find((u: Usuario) => u.id === 1);
      expect(usuario.listaDeseos).not.toContain(1);
      expect(usuario.listaDeseos).toEqual([3]);
    });

    it('no hace nada si no hay token', () => {
      localStorage.removeItem('token');
      const longitudInicial = component.favoritos.length;

      component.eliminarFavorito(1);

      expect(component.favoritos).toHaveLength(longitudInicial);
    });

    it('no hace nada si no hay listaUsuarios', () => {
      localStorage.removeItem('listaUsuarios');
      const longitudInicial = component.favoritos.length;

      component.eliminarFavorito(1);

      expect(component.favoritos).toHaveLength(longitudInicial);
    });

    it('no hace nada si usuario no existe', () => {
      const payload = { id: 999, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      const longitudInicial = component.favoritos.length;

      component.eliminarFavorito(1);

      expect(component.favoritos).toHaveLength(longitudInicial);
    });

    it('no hace nada si producto no está en listaDeseos', () => {
      const favoritosInicial = [...component.favoritos];

      component.eliminarFavorito(2); // No está en los favoritos del usuario 1

      expect(component.favoritos).toHaveLength(favoritosInicial.length);
    });

    it('mantiene otros favoritos intactos', () => {
      component.eliminarFavorito(1);

      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      const usuario = usuarios.find((u: Usuario) => u.id === 1);
      expect(usuario.listaDeseos).toContain(3);
    });

    it('elimina último favorito correctamente', () => {
      component.eliminarFavorito(1);
      component.eliminarFavorito(3);

      expect(component.favoritos).toHaveLength(0);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      const usuario = usuarios.find((u: Usuario) => u.id === 1);
      expect(usuario.listaDeseos).toEqual([]);
    });

    it('no afecta favoritos de otros usuarios', () => {
      component.eliminarFavorito(1);

      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      const otroUsuario = usuarios.find((u: Usuario) => u.id === 2);
      expect(otroUsuario.listaDeseos).toEqual([2]);
    });
  });
});
