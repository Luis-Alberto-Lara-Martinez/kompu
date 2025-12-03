import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { provideRouter, Router } from '@angular/router';

import { Home } from './home';
import { ProductosService } from '../../services/productos/productos-service';

const mockProductos = [
  { id: 1, nombre: 'A', fechaLanzamiento: '2024-01-01T00:00:00.000Z', precio: 10 },
  { id: 2, nombre: 'B', fechaLanzamiento: '2024-05-01T00:00:00.000Z', precio: 20 },
  { id: 3, nombre: 'C', fechaLanzamiento: '2024-03-01T00:00:00.000Z', precio: 30 },
  { id: 4, nombre: 'D', fechaLanzamiento: '2024-06-01T00:00:00.000Z', precio: 40 },
  { id: 5, nombre: 'E', fechaLanzamiento: '2024-02-01T00:00:00.000Z', precio: 50 },
  { id: 6, nombre: 'F', fechaLanzamiento: '2023-12-01T00:00:00.000Z', precio: 60 },
] as any;

class ProductosServiceMock {
  obtenerProductos = vi.fn(() => of(mockProductos));
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let router: Router;
  let servicio: ProductosServiceMock;

  beforeEach(async () => {
    servicio = new ProductosServiceMock();

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: servicio },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
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

  describe('ngOnInit carga productos', () => {
    it('carga desde localStorage y convierte fechas', () => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      expect(component.productos).toHaveLength(6);
      expect(component.productos[0].fechaLanzamiento instanceof Date).toBe(true);
      expect(servicio.obtenerProductos).not.toHaveBeenCalled();
    });

    it('usa servicio si no hay cache y guarda en localStorage', () => {
      localStorage.removeItem('listaProductos');
      component.ngOnInit();
      expect(servicio.obtenerProductos).toHaveBeenCalled();
      const almacenados = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(almacenados).toHaveLength(6);
    });
  });

  describe('cargarUltimosProductos ordena y recorta', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('ordena por fecha descendente y toma 5', () => {
      component['cargarUltimosProductos']();
      expect(component.ultimosProductos).toHaveLength(5);
      const fechas = component.ultimosProductos.map(p => p.fechaLanzamiento.getTime());
      // Verifica orden descendente
      for (let i = 1; i < fechas.length; i++) {
        expect(fechas[i - 1]).toBeGreaterThanOrEqual(fechas[i]);
      }
      // El más nuevo debe ser 2024-06-01
      expect(component.ultimosProductos[0].nombre).toBe('D');
    });
  });

  describe('anadirCarrito comportamiento', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify([
        { id: 1, email: 'u@mail.com', carrito: [], estado: 'activado' },
      ]));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
    });

    it('redirige a login si no hay token', () => {
      localStorage.removeItem('token');
      component.anadirCarrito({ id: 2 } as any);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('muestra "Usuario no encontrado." si el id no existe', () => {
      localStorage.setItem('listaUsuarios', JSON.stringify([]));
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito({ id: 2 } as any);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Usuario no encontrado.');
    });

    it('añade nuevo producto al carrito y persiste', () => {
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito({ id: 2 } as any);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios[0].carrito).toEqual([{ idProducto: 2, cantidad: 1 }]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Añadido al carrito.');
    });

    it('incrementa cantidad si ya existe y muestra mensaje', () => {
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      usuarios[0].carrito = [{ idProducto: 2, cantidad: 1 }];
      localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));

      component.mostrarMensaje = vi.fn();
      component.anadirCarrito({ id: 2 } as any);
      const usuarios2 = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios2[0].carrito[0].cantidad).toBe(2);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Cantidad aumentada en el carrito.');
    });
  });
});
