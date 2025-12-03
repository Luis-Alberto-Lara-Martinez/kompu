import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PaypalButton } from './paypal-button';

describe('PaypalButton', () => {
  let component: PaypalButton;
  let fixture: ComponentFixture<PaypalButton>;
  let mockLocalStorage: { [key: string]: string };
  let renderSpy: ReturnType<typeof vi.fn>;
  let createSpy: ReturnType<typeof vi.fn>;
  let captureSpy: ReturnType<typeof vi.fn>;
  let buttonsSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockLocalStorage = {};

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockLocalStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      mockLocalStorage[key] = value;
      return undefined;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete mockLocalStorage[key];
      return undefined;
    });

    await TestBed.configureTestingModule({
      imports: [PaypalButton]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PaypalButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no debe inicializar si paypal es undefined', () => {
    // Asegurar que paypal está undefined
    (globalThis as any).paypal = undefined;
    component.totalCompra = 123.45;
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('debe renderizar el botón y crear orden con total formateado', async () => {
    renderSpy = vi.fn();
    createSpy = vi.fn().mockResolvedValue({ id: 'ORDER-ID' });
    buttonsSpy = vi.fn().mockReturnValue({ render: renderSpy });

    // Mock de acciones de paypal
    const actions: any = { order: { create: createSpy, capture: vi.fn() } };

    // Mock de paypal.Buttons
    (globalThis as any).paypal = {
      Buttons: vi.fn((cfg: any) => {
        // Llamar manualmente a createOrder para verificar formato
        component.totalCompra = 200; // 200.00
        cfg.createOrder({}, { order: { create: createSpy } });
        return { render: renderSpy };
      })
    };

    component.totalCompra = 200;
    component.ngOnInit();

    expect((globalThis as any).paypal.Buttons).toHaveBeenCalled();
    expect(renderSpy).toHaveBeenCalledWith('#paypal-button-container');
    // Verifica que se formatea a 2 decimales
    expect(createSpy).toHaveBeenCalledWith({
      purchase_units: [
        { amount: { value: '200.00' } }
      ]
    });
  });

  it('debe capturar la orden en onApprove y recargar la página', async () => {
    // Preparar datos de localStorage necesarios para crear pedido
    const payload = { id: 10 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    mockLocalStorage['token'] = token;
    mockLocalStorage['listaUsuarios'] = JSON.stringify([
      { id: 10, carrito: [{ idProducto: 1, cantidad: 2 }] }
    ]);
    mockLocalStorage['listaProductos'] = JSON.stringify([
      { id: 1, precio: 50 }
    ]);
    mockLocalStorage['listaPedidos'] = JSON.stringify([]);

    // Mock de reload de forma segura en JSDOM
    const originalLocation = window.location;
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadSpy }
    });

    captureSpy = vi.fn().mockResolvedValue({ status: 'COMPLETED' });
    const actionsApprove: any = { order: { capture: captureSpy } };

    let onApproveFn: Function | undefined;
    buttonsSpy = vi.fn().mockReturnValue({ render: vi.fn() });

    (globalThis as any).paypal = {
      Buttons: vi.fn((cfg: any) => {
        onApproveFn = cfg.onApprove;
        return { render: vi.fn() };
      })
    };

    component.totalCompra = 121; // para calcular IVA y subprecio
    component.ngOnInit();
    expect(typeof onApproveFn).toBe('function');

    // Ejecutar onApprove
    await (onApproveFn as Function)({}, actionsApprove);

    // Verifica capture fue llamado
    expect(captureSpy).toHaveBeenCalled();

    // Verifica que se creó listaPedidos y se vació el carrito
    const pedidos = JSON.parse(mockLocalStorage['listaPedidos']);
    expect(pedidos.length).toBe(1);
    expect(pedidos[0].precioTotal).toBe(121);
    expect(pedidos[0].subprecio).toBe(Number((121 / 1.21).toFixed(2)));
    expect(pedidos[0].iva).toBe(Number((121 - Number((121 / 1.21).toFixed(2))).toFixed(2)));

    const usuarios = JSON.parse(mockLocalStorage['listaUsuarios']);
    expect(usuarios[0].carrito.length).toBe(0);

    // Verifica reload
    expect(reloadSpy).toHaveBeenCalled();

    // Restaurar location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  it('debe manejar errores en onError sin lanzar excepciones', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    let onErrorFn: Function | undefined;

    (globalThis as any).paypal = {
      Buttons: vi.fn((cfg: any) => {
        onErrorFn = cfg.onError;
        return { render: vi.fn() };
      })
    };

    component.ngOnInit();
    expect(typeof onErrorFn).toBe('function');
    expect(() => (onErrorFn as Function)(new Error('Fallo'))).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('crearPedidoYLimpiarCarrito no debe fallar si faltan datos', () => {
    // token ausente
    delete mockLocalStorage['token'];
    // @ts-ignore acceso al método privado mediante cast
    expect(() => (component as any).crearPedidoYLimpiarCarrito()).not.toThrow();

    // token presente pero usuario no existe
    const payload = { id: 99 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    mockLocalStorage['token'] = token;
    mockLocalStorage['listaUsuarios'] = JSON.stringify([{ id: 10, carrito: [] }]);
    mockLocalStorage['listaProductos'] = JSON.stringify([]);
    // @ts-ignore
    expect(() => (component as any).crearPedidoYLimpiarCarrito()).not.toThrow();
  });

  it('debe calcular precios de productos del pedido correctamente', () => {
    const payload = { id: 5 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    mockLocalStorage['token'] = token;
    mockLocalStorage['listaUsuarios'] = JSON.stringify([
      {
        id: 5, carrito: [
          { idProducto: 1, cantidad: 1 },
          { idProducto: 2, cantidad: 3 },
          { idProducto: 3, cantidad: 2 },
        ]
      }
    ]);
    mockLocalStorage['listaProductos'] = JSON.stringify([
      { id: 1, precio: 10 },
      { id: 2, precio: 0 },
      { id: 3, precio: 7.5 },
    ]);
    mockLocalStorage['listaPedidos'] = JSON.stringify([]);

    component.totalCompra = 100;
    // @ts-ignore
    (component as any).crearPedidoYLimpiarCarrito();

    const pedidos = JSON.parse(mockLocalStorage['listaPedidos']);
    expect(pedidos.length).toBe(1);
    // precios capturados por producto (cuando no existe, precio 0)
    const precios = pedidos[0].listaProductos.map((p: any) => p.precio);
    expect(precios).toEqual([10, 0, 7.5]);
  });
});
