import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { GestionProductos } from './gestion-productos';
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
    descripcion: 'Teclado mecánico RGB',
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
    descripcion: 'Ratón con sensor óptico',
    valoraciones: [],
    fechaLanzamiento: new Date('2024-02-01'),
  },
] as Producto[];

describe('GestionProductos', () => {
  let component: GestionProductos;
  let fixture: ComponentFixture<GestionProductos>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProductos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionProductos);
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
    it('carga productos desde localStorage si existe (rol administrador)', () => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      expect(component.productos).toHaveLength(2);
      expect(component.productos[0].nombre).toBe('Teclado Mecánico');
    });

    it('mantiene array vacío si no hay listaProductos en localStorage', () => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.removeItem('listaProductos');
      component.ngOnInit();
      expect(component.productos).toHaveLength(0);
    });

    it('redirige a /home si no hay token', () => {
      localStorage.removeItem('token');
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('redirige a /home si el rol no es administrador', () => {
      const payloadUsuario = { id: 1, rol: 'usuario', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadUsuario))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(component.productos).toHaveLength(0);
    });
  });

  describe('guardarProductos', () => {
    it('persiste productos en localStorage', () => {
      component.productos = mockProductos;
      component.guardarProductos();
      const guardado = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(guardado).toHaveLength(2);
      expect(guardado[0].nombre).toBe('Teclado Mecánico');
    });
  });

  describe('iniciarEdicion y cancelarEdicion', () => {
    beforeEach(() => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('inicia edición estableciendo editandoId', () => {
      const producto = component.productos[0];
      component.iniciarEdicion(producto);
      expect(component.editandoId).toBe(1);
    });

    it('cancela edición reseteando editandoId a null', () => {
      component.editandoId = 5;
      component.cancelarEdicion();
      expect(component.editandoId).toBeNull();
    });
  });

  describe('guardarEdicion', () => {
    beforeEach(() => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      component.editandoId = 1;
    });

    it('convierte precio y stock a números', () => {
      const producto = component.productos[0];
      producto.precio = '99.5' as any;
      producto.stock = '15' as any;

      component.guardarEdicion(producto);

      expect(producto.precio).toBe(99.5);
      expect(producto.stock).toBe(15);
    });

    it('persiste cambios en localStorage', () => {
      const producto = component.productos[0];
      producto.nombre = 'Teclado Actualizado';

      component.guardarEdicion(producto);

      const guardado = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(guardado[0].nombre).toBe('Teclado Actualizado');
    });

    it('resetea editandoId después de guardar', () => {
      const producto = component.productos[0];
      component.guardarEdicion(producto);
      expect(component.editandoId).toBeNull();
    });

    it('maneja valores inválidos estableciendo 0', () => {
      const producto = component.productos[0];
      producto.precio = 'abc' as any;
      producto.stock = null as any;

      component.guardarEdicion(producto);

      expect(producto.precio).toBe(0);
      expect(producto.stock).toBe(0);
    });
  });

  describe('eliminarProducto', () => {
    beforeEach(() => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('elimina producto del array', () => {
      const productoAEliminar = component.productos[0];
      component.eliminarProducto(productoAEliminar);
      expect(component.productos).toHaveLength(1);
      expect(component.productos.find(p => p.id === 1)).toBeUndefined();
    });

    it('persiste cambios en localStorage', () => {
      const productoAEliminar = component.productos[1];
      component.eliminarProducto(productoAEliminar);

      const guardado = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(guardado).toHaveLength(1);
      expect(guardado[0].id).toBe(1);
    });

    it('no afecta otros productos', () => {
      const productoAEliminar = component.productos[0];
      component.eliminarProducto(productoAEliminar);
      expect(component.productos[0].nombre).toBe('Ratón Gamer');
    });
  });

  describe('agregarProducto', () => {
    beforeEach(() => {
      const payloadAdmin = { id: 999, rol: 'administrador', exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payloadAdmin))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('agrega producto con datos completos', () => {
      component.nuevoProducto = {
        nombre: 'Monitor 4K',
        marca: 'Samsung',
        categoria: 'Monitores',
        precio: 350,
        stock: 5,
        descripcion: 'Monitor Ultra HD',
      };
      component.listaImagenUrl = 'monitor.jpg';

      component.agregarProducto();

      expect(component.productos).toHaveLength(3);
      const nuevo = component.productos[2];
      expect(nuevo.nombre).toBe('Monitor 4K');
      expect(nuevo.marca).toBe('Samsung');
      expect(nuevo.listaImagenes).toEqual(['monitor.jpg']);
    });

    it('asigna ID incremental correctamente', () => {
      component.nuevoProducto = { nombre: 'Test' };
      component.agregarProducto();

      const nuevo = component.productos[component.productos.length - 1];
      expect(nuevo.id).toBe(3); // Max era 2, nuevo debe ser 3
    });

    it('asigna ID 1 si el array está vacío', () => {
      component.productos = [];
      component.nuevoProducto = { nombre: 'Primer producto' };

      component.agregarProducto();

      expect(component.productos[0].id).toBe(1);
    });

    it('usa valores por defecto para campos vacíos', () => {
      component.nuevoProducto = {};
      component.listaImagenUrl = '';

      component.agregarProducto();

      const nuevo = component.productos[component.productos.length - 1];
      expect(nuevo.nombre).toBe('Nuevo producto');
      expect(nuevo.marca).toBe('Sin marca');
      expect(nuevo.categoria).toBe('general');
      expect(nuevo.precio).toBe(0);
      expect(nuevo.stock).toBe(0);
      expect(nuevo.listaImagenes).toEqual([]);
      expect(nuevo.descripcion).toBe('');
    });

    it('persiste nuevo producto en localStorage', () => {
      component.nuevoProducto = { nombre: 'Auriculares', precio: 60 };
      component.agregarProducto();

      const guardado = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(guardado).toHaveLength(3);
      expect(guardado[2].nombre).toBe('Auriculares');
    });

    it('resetea formulario después de agregar', () => {
      component.nuevoProducto = {
        nombre: 'Test',
        marca: 'Brand',
        precio: 100,
      };
      component.listaImagenUrl = 'test.jpg';

      component.agregarProducto();

      expect(component.nuevoProducto.nombre).toBe('');
      expect(component.nuevoProducto.marca).toBe('');
      expect(component.nuevoProducto.precio).toBe(0);
      expect(component.listaImagenUrl).toBe('');
    });

    it('inicializa arrays vacíos para valoraciones', () => {
      component.nuevoProducto = { nombre: 'Test' };
      component.agregarProducto();

      const nuevo = component.productos[component.productos.length - 1];
      expect(nuevo.valoraciones).toEqual([]);
    });

    it('establece fechaLanzamiento a fecha actual', () => {
      const antes = new Date();
      component.nuevoProducto = { nombre: 'Test' };
      component.agregarProducto();
      const despues = new Date();

      const nuevo = component.productos[component.productos.length - 1];
      expect(nuevo.fechaLanzamiento.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(nuevo.fechaLanzamiento.getTime()).toBeLessThanOrEqual(despues.getTime());
    });
  });
});
