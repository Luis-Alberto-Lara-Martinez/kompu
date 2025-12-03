import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router } from '@angular/router';

import { HistorialPedidos } from './historial-pedidos';

const mockProductos = [
  { id: 1, nombre: 'Teclado Mecánico', listaImagenes: ['teclado.jpg'], precio: 50 },
  { id: 2, nombre: 'Ratón Gamer', listaImagenes: ['raton.jpg'], precio: 30 },
  { id: 3, nombre: 'Monitor 4K', listaImagenes: ['monitor.jpg'], precio: 400 },
] as any;

const mockPedidos = [
  {
    id: 1,
    idUsuario: 1,
    fecha: '2024-12-01T10:00:00.000Z',
    estado: 'entregado',
    total: 80,
    listaProductos: [
      { idProducto: 1, cantidad: 1, precio: 50 },
      { idProducto: 2, cantidad: 1, precio: 30 },
    ],
  },
  {
    id: 2,
    idUsuario: 2,
    fecha: '2024-11-15T14:00:00.000Z',
    estado: 'enviado',
    total: 400,
    listaProductos: [
      { idProducto: 3, cantidad: 1, precio: 400 },
    ],
  },
  {
    id: 3,
    idUsuario: 1,
    fecha: '2024-11-20T09:00:00.000Z',
    estado: 'pendiente',
    total: 30,
    listaProductos: [
      { idProducto: 2, cantidad: 1, precio: 30 },
    ],
  },
] as any;

describe('HistorialPedidos', () => {
  let component: HistorialPedidos;
  let fixture: ComponentFixture<HistorialPedidos>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPedidos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialPedidos);
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
    it('no carga pedidos si no hay token', () => {
      localStorage.removeItem('token');
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaPedidos', JSON.stringify(mockPedidos));

      component.ngOnInit();
      expect(component.pedidos).toHaveLength(0);
    });

    it('no carga pedidos si no hay listaPedidos en localStorage', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.removeItem('listaPedidos');

      component.ngOnInit();
      expect(component.pedidos).toHaveLength(0);
    });

    it('carga productos desde localStorage', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaPedidos', JSON.stringify(mockPedidos));

      component.ngOnInit();
      expect(component.listaProductos).toHaveLength(3);
    });

    it('filtra pedidos por usuario actual', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaPedidos', JSON.stringify(mockPedidos));

      component.ngOnInit();
      expect(component.pedidos).toHaveLength(2);
      expect(component.pedidos.every(p => p.idUsuario === 1)).toBe(true);
    });

    it('enriquece pedidos con información de productos', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaPedidos', JSON.stringify(mockPedidos));

      component.ngOnInit();
      const primerPedido = component.pedidos[0];
      expect(primerPedido.productosConInfo).toBeDefined();
      expect(primerPedido.productosConInfo[0].nombre).toBeDefined();
      expect(primerPedido.productosConInfo[0].imagen).toBeDefined();
    });

    it('ordena pedidos por fecha descendente (más recientes primero)', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaPedidos', JSON.stringify(mockPedidos));

      component.ngOnInit();
      const fechas = component.pedidos.map(p => new Date(p.fecha).getTime());
      for (let i = 1; i < fechas.length; i++) {
        expect(fechas[i - 1]).toBeGreaterThanOrEqual(fechas[i]);
      }
    });

    it('maneja productos no encontrados con nombre por defecto', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));

      const pedidoConProductoInexistente = [{
        id: 10,
        idUsuario: 1,
        fecha: '2024-12-01T10:00:00.000Z',
        estado: 'pendiente',
        total: 100,
        listaProductos: [{ idProducto: 999, cantidad: 1, precio: 100 }],
      }];
      localStorage.setItem('listaPedidos', JSON.stringify(pedidoConProductoInexistente));

      component.ngOnInit();
      expect(component.pedidos[0].productosConInfo[0].nombre).toBe('Producto desconocido');
      expect(component.pedidos[0].productosConInfo[0].imagen).toBe('');
    });
  });

  describe('obtenerNombreProducto', () => {
    beforeEach(() => {
      component.listaProductos = mockProductos;
    });

    it('devuelve el nombre del producto si existe', () => {
      expect(component.obtenerNombreProducto(1)).toBe('Teclado Mecánico');
      expect(component.obtenerNombreProducto(2)).toBe('Ratón Gamer');
    });

    it('devuelve "Producto desconocido" si no existe', () => {
      expect(component.obtenerNombreProducto(999)).toBe('Producto desconocido');
    });
  });

  describe('formatearFecha', () => {
    it('formatea fecha correctamente en español', () => {
      const fecha = new Date('2024-12-01T10:00:00.000Z');
      const resultado = component.formatearFecha(fecha);
      expect(resultado).toContain('2024');
      expect(resultado).toMatch(/diciembre|december/i);
    });

    it('acepta string y lo convierte a Date', () => {
      const fechaString = '2024-11-15T14:00:00.000Z';
      const resultado = component.formatearFecha(fechaString);
      expect(resultado).toContain('2024');
    });
  });

  describe('obtenerClaseEstado', () => {
    it('devuelve "estado-entregado" para entregado', () => {
      expect(component.obtenerClaseEstado('entregado')).toBe('estado-entregado');
      expect(component.obtenerClaseEstado('ENTREGADO')).toBe('estado-entregado');
    });

    it('devuelve "estado-enviado" para enviado', () => {
      expect(component.obtenerClaseEstado('enviado')).toBe('estado-enviado');
      expect(component.obtenerClaseEstado('Enviado')).toBe('estado-enviado');
    });

    it('devuelve "estado-pendiente" para pendiente', () => {
      expect(component.obtenerClaseEstado('pendiente')).toBe('estado-pendiente');
      expect(component.obtenerClaseEstado('PENDIENTE')).toBe('estado-pendiente');
    });

    it('devuelve "estado-pendiente" por defecto para estados desconocidos', () => {
      expect(component.obtenerClaseEstado('cancelado')).toBe('estado-pendiente');
      expect(component.obtenerClaseEstado('')).toBe('estado-pendiente');
    });
  });
});
