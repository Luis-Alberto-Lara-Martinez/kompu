import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { DetallesProducto } from './detalles-producto';
import { ProductosService } from '../../services/productos/productos-service';
import { Producto } from '../../models/producto';
import { Usuario } from '../../models/usuario';

const mockProductos: Producto[] = [
  {
    id: 1,
    nombre: 'Teclado Mecánico',
    marca: 'Logitech',
    categoria: 'Periféricos',
    precio: 75,
    stock: 10,
    listaImagenes: ['teclado1.jpg', 'teclado2.jpg'],
    descripcion: 'Teclado RGB',
    valoraciones: [
      { idUsuario: 2, nota: 5, comentario: 'Excelente' },
      { idUsuario: 3, nota: 4, comentario: 'Muy bueno' },
    ],
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
    listaDeseos: [],
  },
  {
    id: 2,
    nombre: 'Ana López',
    email: 'ana@mail.com',
    clave: 'hash456',
    telefono: '987654321',
    direccion: 'Calle 2',
    rol: 'usuario',
    estado: 'activado',
    carrito: [],
    listaDeseos: [2],
  },
  {
    id: 3,
    nombre: 'Carlos Ruiz',
    email: 'carlos@mail.com',
    clave: 'hash789',
    telefono: '555555555',
    direccion: 'Calle 3',
    rol: 'usuario',
    estado: 'activado',
    carrito: [],
    listaDeseos: [],
  },
] as Usuario[];

class ProductosServiceMock {
  obtenerProductos = vi.fn(() => of(mockProductos));
}

describe('DetallesProducto', () => {
  let component: DetallesProducto;
  let fixture: ComponentFixture<DetallesProducto>;
  let router: Router;
  let productosService: ProductosServiceMock;

  beforeEach(async () => {
    productosService = new ProductosServiceMock();

    await TestBed.configureTestingModule({
      imports: [DetallesProducto],
      providers: [
        provideRouter([]),
        { provide: ProductosService, useValue: productosService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesProducto);
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
    it('carga producto desde localStorage si existe cache', () => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
      expect(component.producto).toBeDefined();
      expect(component.producto?.id).toBe(1);
      expect(component.producto?.nombre).toBe('Teclado Mecánico');
    });

    it('usa servicio si no hay cache y guarda en localStorage', () => {
      localStorage.removeItem('listaProductos');
      component.ngOnInit();
      expect(productosService.obtenerProductos).toHaveBeenCalled();
    });

    it('carga usuarios desde localStorage', () => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      component.ngOnInit();
      expect(component.usuarios).toHaveLength(3);
    });

    it('no carga producto si no hay id en la ruta', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [DetallesProducto],
        providers: [
          provideRouter([]),
          { provide: ProductosService, useValue: productosService },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: () => null } },
            },
          },
        ],
      });
      const newFixture = TestBed.createComponent(DetallesProducto);
      const newComponent = newFixture.componentInstance;

      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      newComponent.ngOnInit();
      expect(newComponent.producto).toBeUndefined();
    });
  });

  describe('anadirFavorito comportamiento', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
    });

    it('redirige a login si no hay token', () => {
      localStorage.removeItem('token');
      component.anadirFavorito(mockProductos[0]);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('muestra mensaje si usuario no existe', () => {
      const payload = { id: 999, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Usuario no encontrado.');
    });

    it('añade producto a favoritos y persiste', () => {
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0]);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios[0].listaDeseos).toContain(1);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Añadido a favoritos.');
    });

    it('muestra mensaje si producto ya está en favoritos', () => {
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      usuarios[0].listaDeseos = [1];
      localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));
      component.mostrarMensaje = vi.fn();
      component.anadirFavorito(mockProductos[0]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Este producto ya está en tus favoritos.');
    });
  });

  describe('anadirCarrito comportamiento', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
    });

    it('redirige a login si no hay token', () => {
      localStorage.removeItem('token');
      component.anadirCarrito(mockProductos[0]);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('muestra mensaje si usuario no existe', () => {
      const payload = { id: 999, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito(mockProductos[0]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Usuario no encontrado.');
    });

    it('añade producto nuevo al carrito', () => {
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito(mockProductos[0]);
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios[0].carrito).toEqual([{ idProducto: 1, cantidad: 1 }]);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Añadido al carrito.');
    });

    it('incrementa cantidad si producto ya existe en carrito', () => {
      const usuarios = JSON.parse(localStorage.getItem('listaUsuarios')!);
      usuarios[0].carrito = [{ idProducto: 1, cantidad: 1 }];
      localStorage.setItem('listaUsuarios', JSON.stringify(usuarios));
      component.mostrarMensaje = vi.fn();
      component.anadirCarrito(mockProductos[0]);
      const usuarios2 = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(usuarios2[0].carrito[0].cantidad).toBe(2);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('Cantidad aumentada en el carrito.');
    });
  });

  describe('obtenerNombreUsuario', () => {
    beforeEach(() => {
      component.usuarios = mockUsuarios;
    });

    it('devuelve nombre de usuario si existe', () => {
      expect(component.obtenerNombreUsuario(2)).toBe('Ana López');
      expect(component.obtenerNombreUsuario(3)).toBe('Carlos Ruiz');
    });

    it('devuelve "Usuario desconocido" si no existe', () => {
      expect(component.obtenerNombreUsuario(999)).toBe('Usuario desconocido');
    });
  });

  describe('generarEstrellas', () => {
    it('genera estrellas llenas y vacías correctamente', () => {
      expect(component.generarEstrellas(5)).toEqual(['★', '★', '★', '★', '★']);
      expect(component.generarEstrellas(3)).toEqual(['★', '★', '★', '☆', '☆']);
      expect(component.generarEstrellas(0)).toEqual(['☆', '☆', '☆', '☆', '☆']);
    });
  });

  describe('calcularPromedioValoraciones', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      component.ngOnInit();
    });

    it('calcula promedio correctamente', () => {
      expect(component.calcularPromedioValoraciones()).toBe(4.5);
    });

    it('devuelve 0 si no hay valoraciones', () => {
      component.producto = mockProductos[1]; // Sin valoraciones
      expect(component.calcularPromedioValoraciones()).toBe(0);
    });

    it('devuelve 0 si no hay producto', () => {
      component.producto = undefined;
      expect(component.calcularPromedioValoraciones()).toBe(0);
    });
  });

  describe('toggleFormularioResena', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
    });

    it('redirige a login si no hay token', () => {
      localStorage.removeItem('token');
      component.toggleFormularioResena();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('alterna mostrarFormularioResena', () => {
      expect(component.mostrarFormularioResena).toBe(false);
      component.toggleFormularioResena();
      expect(component.mostrarFormularioResena).toBe(true);
      component.toggleFormularioResena();
      expect(component.mostrarFormularioResena).toBe(false);
    });

    it('resetea formulario al cerrar', () => {
      component.nuevaResena = { nota: 3, comentario: 'Test' };
      component.mostrarFormularioResena = true;
      component.toggleFormularioResena();
      expect(component.nuevaResena).toEqual({ nota: 5, comentario: '' });
    });
  });

  describe('enviarResena', () => {
    beforeEach(() => {
      localStorage.setItem('listaProductos', JSON.stringify(mockProductos));
      localStorage.setItem('listaUsuarios', JSON.stringify(mockUsuarios));
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 3600 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);
      component.ngOnInit();
      component.mostrarFormularioResena = true;
    });

    it('redirige a login si no hay token', () => {
      localStorage.removeItem('token');
      component.enviarResena();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('añade valoración al producto y persiste', () => {
      component.nuevaResena = { nota: 5, comentario: 'Excelente producto' };
      component.mostrarMensaje = vi.fn();

      component.enviarResena();

      expect(component.producto?.valoraciones).toHaveLength(3);
      const nuevaVal = component.producto?.valoraciones[2];
      expect(nuevaVal?.idUsuario).toBe(1);
      expect(nuevaVal?.nota).toBe(5);
      expect(nuevaVal?.comentario).toBe('Excelente producto');

      const productos = JSON.parse(localStorage.getItem('listaProductos')!);
      expect(productos[0].valoraciones).toHaveLength(3);
      expect(component.mostrarMensaje).toHaveBeenCalledWith('¡Gracias por tu reseña!');
    });

    it('muestra mensaje si usuario ya valoró el producto', () => {
      component.producto!.valoraciones.push({ idUsuario: 1, nota: 4, comentario: 'Ya valorado' });
      component.mostrarMensaje = vi.fn();

      component.enviarResena();

      expect(component.mostrarMensaje).toHaveBeenCalledWith('Ya has valorado este producto.');
    });

    it('maneja comentario vacío como null', () => {
      component.nuevaResena = { nota: 4, comentario: '   ' };
      component.enviarResena();

      const nuevaVal = component.producto?.valoraciones[2];
      expect(nuevaVal?.comentario).toBeNull();
    });

    it('resetea y cierra formulario después de enviar', () => {
      component.nuevaResena = { nota: 5, comentario: 'Test' };
      component.enviarResena();

      expect(component.mostrarFormularioResena).toBe(false);
      expect(component.nuevaResena).toEqual({ nota: 5, comentario: '' });
    });
  });

  describe('cancelarResena', () => {
    it('cierra formulario y resetea datos', () => {
      component.mostrarFormularioResena = true;
      component.nuevaResena = { nota: 3, comentario: 'Test' };

      component.cancelarResena();

      expect(component.mostrarFormularioResena).toBe(false);
      expect(component.nuevaResena).toEqual({ nota: 5, comentario: '' });
    });
  });
});
