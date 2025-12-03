import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { of, Subject } from 'rxjs';

import { Productos } from './productos';
import { ProductosService } from '../../services/productos/productos-service';

const mockProductos = [
  { id: 1, nombre: 'Teclado', descripcion: 'Mecánico', categoria: 'Periféricos', marca: 'Logi', precio: 50 },
  { id: 2, nombre: 'Ratón', descripcion: 'Óptico', categoria: 'Periféricos', marca: 'Logi', precio: 30 },
  { id: 3, nombre: 'Monitor', descripcion: '24 pulgadas', categoria: 'Monitores', marca: 'Dell', precio: 120 },
] as any;

class ProductosServiceMock {
  obtenerProductos = vi.fn(() => of(mockProductos));
}

describe('Productos', () => {
  let component: Productos;
  let fixture: ComponentFixture<Productos>;
  let router: Router;
  let productosService: ProductosServiceMock;
  let queryParams$: Subject<any>;

  beforeEach(async () => {
    productosService = new ProductosServiceMock();
    queryParams$ = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [Productos],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: productosService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParams$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Productos);
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

  describe('carga e inicialización', () => {
    it('carga de localStorage si existe cache', () => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      queryParams$.next({});
      expect(component.productos).toHaveLength(3);
      expect(component.categorias).toContain('Periféricos');
      expect(component.marcas).toContain('Logi');
      expect(component.precioMaximoProductos).toBe(120);
    });

    it('usa servicio si no hay cache y guarda en localStorage', () => {
      localStorage.removeItem('listaProductos');
      component.ngOnInit();
      queryParams$.next({});
      expect(productosService.obtenerProductos).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('listaProductos')!)).toHaveLength(3);
    });

    it('aplica buscador desde queryParams', () => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      queryParams$.next({ terminoABuscar: 'monitor' });
      expect(component.buscador).toBe('monitor');
      component.aplicarFiltros();
      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productosFiltrados[0].nombre).toBe('Monitor');
    });
  });

  describe('filtros y orden', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      queryParams$.next({});
    });

    it('filtra por categoría', () => {
      component.seleccionarCategoria('Periféricos');
      expect(component.productosFiltrados.every(p => p.categoria === 'Periféricos')).toBe(true);
    });

    it('filtra por marca', () => {
      component.seleccionarMarca('Logi');
      expect(component.productosFiltrados.every(p => p.marca === 'Logi')).toBe(true);
    });

    it('filtra por rango de precio', () => {
      component.filtros.precioMin = 40;
      component.filtros.precioMax = 60;
      component.aplicarFiltros();
      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productosFiltrados[0].precio).toBe(50);
    });

    it('limpia filtros y navega a /productos', async () => {
      component.seleccionarCategoria('Periféricos');
      component.limpiarFiltros();
      expect(component.filtros.categoria).toBe('');
      expect(component.buscador).toBe('');
      expect(router.navigate).toHaveBeenCalledWith(['/productos']);
    });

    it('ordena por precio descendente', () => {
      component.ordenSeleccionado = 'precio-desc';
      component.ordenarProductos();
      expect(component.productosFiltrados[0].precio).toBeGreaterThanOrEqual(component.productosFiltrados[1].precio);
    });

    it('ordena por precio ascendente', () => {
      component.ordenSeleccionado = 'precio-asc';
      component.ordenarProductos();
      expect(component.productosFiltrados[0].precio).toBeLessThanOrEqual(component.productosFiltrados[1].precio);
    });

    it('ordena por nombre ascendente', () => {
      component.ordenSeleccionado = 'nombre-asc';
      component.ordenarProductos();
      const nombres = component.productosFiltrados.map(p => p.nombre);
      expect([...nombres].sort()).toEqual(nombres);
    });
  });

  describe('favoritos y carrito', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify([
        { id: 1, email: 'user@mail.com', listaDeseos: [], carrito: [], estado: 'activado' },
      ]));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
      queryParams$.next({});
    });

    it('redirige a login si no hay token al añadir favorito', () => {
      localStorage.removeItem('token');
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0] as any);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('añade favorito si no existe y guarda en localStorage', () => {
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0] as any);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios[0].listaDeseos).toContain(1);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Añadido a favoritos.');
    });

    it('no duplica favorito y muestra mensaje', () => {
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      usuarios[0].listaDeseos = [1];
      localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0] as any);
      const usuarios2 = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios2[0].listaDeseos).toEqual([1]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Este producto ya está en tus favoritos.');
    });

    it('añade al carrito cuando no existe y guarda cambios', () => {
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito(mockProductos[1] as any);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios[0].carrito).toEqual([{ idProducto: 2, cantidad: 1 }]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Añadido al carrito.');
    });

    it('incrementa cantidad si ya existe en carrito', () => {
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      usuarios[0].carrito = [{ idProducto: 2, cantidad: 1 }];
      localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito(mockProductos[1] as any);
      const usuarios2 = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios2[0].carrito[0].cantidad).toBe(2);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Cantidad aumentada en el carrito');
    });
  });
});
