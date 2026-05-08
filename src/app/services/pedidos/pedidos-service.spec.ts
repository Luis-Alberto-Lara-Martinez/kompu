import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {PedidosService} from './pedidos-service';
import {Pedido} from '../../models/pedido';
import {provideHttpClient} from '@angular/common/http';

describe('PedidosService', () => {
  let service: PedidosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PedidosService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PedidosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener pedidos y convertir fecha a Date', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos.length).toBe(2);
      expect(pedidos[0].fecha instanceof Date).toBe(true);
      expect(pedidos[1].fecha instanceof Date).toBe(true);
      expect(pedidos[0].estado).toBe("entregado");
      expect(pedidos[1].estado).toBe("enviado");
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockPedidos);
  });

  it('debe manejar lista vacía de pedidos', () => {
    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos).toEqual([]);
      expect(pedidos.length).toBe(0);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush([]);
  });

  it('debe preservar todos los campos del pedido', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const pedido = pedidos[0];
      expect(pedido.id).toBe(1);
      expect(pedido.idUsuario).toBe(2);
      expect(pedido.fecha instanceof Date).toBe(true);
      expect(pedido.listaProductos.length).toBe(1);
      expect(pedido.precioTotal).toBe(899.99);
      expect(pedido.estado).toBe("entregado");
      expect(pedido.numFactura).toBe(1001);
      expect(pedido.subprecio).toBe(899.99);
      expect(pedido.iva).toBe(189.00);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con estado "entregado"', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos[0].estado).toBe("entregado");
      expect(pedidos[0].fecha instanceof Date).toBe(true);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con estado "enviado"', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          },
          {
            "idProducto": 4,
            "cantidad": 1,
            "precio": 69.99
          }
        ],
        "precioTotal": 199.98,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 199.98,
        "iva": 42.00
      },
      {
        "id": 3,
        "idUsuario": 6,
        "fecha": "2025-11-23" as any,
        "listaProductos": [
          {
            "idProducto": 2,
            "cantidad": 1,
            "precio": 299.99
          }
        ],
        "precioTotal": 299.99,
        "estado": "enviado",
        "numFactura": 1003,
        "subprecio": 299.99,
        "iva": 63.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      pedidos.forEach(pedido => {
        expect(pedido.estado).toBe("enviado");
      });
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con estado "pendiente"', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 4,
        "idUsuario": 9,
        "fecha": "2025-11-24" as any,
        "listaProductos": [
          {
            "idProducto": 5,
            "cantidad": 1,
            "precio": 649.99
          }
        ],
        "precioTotal": 649.99,
        "estado": "pendiente",
        "numFactura": 1004,
        "subprecio": 649.99,
        "iva": 136.50
      },
      {
        "id": 5,
        "idUsuario": 2,
        "fecha": "2025-11-25" as any,
        "listaProductos": [
          {
            "idProducto": 8,
            "cantidad": 1,
            "precio": 179.99
          }
        ],
        "precioTotal": 179.99,
        "estado": "pendiente",
        "numFactura": 1005,
        "subprecio": 179.99,
        "iva": 37.80
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      pedidos.forEach(pedido => {
        expect(pedido.estado).toBe("pendiente");
      });
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con un solo producto', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos[0].listaProductos.length).toBe(1);
      expect(pedidos[0].listaProductos[0].idProducto).toBe(1);
      expect(pedidos[0].listaProductos[0].cantidad).toBe(1);
      expect(pedidos[0].listaProductos[0].precio).toBe(899.99);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con múltiples productos', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          },
          {
            "idProducto": 4,
            "cantidad": 1,
            "precio": 69.99
          }
        ],
        "precioTotal": 199.98,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 199.98,
        "iva": 42.00
      },
      {
        "id": 4,
        "idUsuario": 9,
        "fecha": "2025-11-24" as any,
        "listaProductos": [
          {
            "idProducto": 5,
            "cantidad": 1,
            "precio": 649.99
          },
          {
            "idProducto": 7,
            "cantidad": 1,
            "precio": 139.99
          }
        ],
        "precioTotal": 789.98,
        "estado": "pendiente",
        "numFactura": 1004,
        "subprecio": 789.98,
        "iva": 165.90
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos[0].listaProductos.length).toBe(2);
      expect(pedidos[1].listaProductos.length).toBe(2);
      expect(pedidos[0].listaProductos[0].idProducto).toBe(3);
      expect(pedidos[0].listaProductos[1].idProducto).toBe(4);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos de diferentes usuarios', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      },
      {
        "id": 3,
        "idUsuario": 6,
        "fecha": "2025-11-23" as any,
        "listaProductos": [
          {
            "idProducto": 2,
            "cantidad": 1,
            "precio": 299.99
          }
        ],
        "precioTotal": 299.99,
        "estado": "enviado",
        "numFactura": 1003,
        "subprecio": 299.99,
        "iva": 63.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const idsUsuarios = pedidos.map(p => p.idUsuario);
      expect(idsUsuarios).toContain(2);
      expect(idsUsuarios).toContain(4);
      expect(idsUsuarios).toContain(6);
      expect(new Set(idsUsuarios).size).toBe(3);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos del mismo usuario', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 5,
        "idUsuario": 2,
        "fecha": "2025-11-25" as any,
        "listaProductos": [
          {
            "idProducto": 8,
            "cantidad": 1,
            "precio": 179.99
          }
        ],
        "precioTotal": 179.99,
        "estado": "pendiente",
        "numFactura": 1005,
        "subprecio": 179.99,
        "iva": 37.80
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      pedidos.forEach(pedido => {
        expect(pedido.idUsuario).toBe(2);
      });
      expect(pedidos.length).toBe(2);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe validar cálculo correcto de precios con IVA', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const pedido = pedidos[0];
      expect(pedido.subprecio).toBe(899.99);
      expect(pedido.iva).toBe(189.00);
      expect(pedido.precioTotal).toBe(899.99);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar números de factura únicos y secuenciales', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      },
      {
        "id": 3,
        "idUsuario": 6,
        "fecha": "2025-11-23" as any,
        "listaProductos": [
          {
            "idProducto": 2,
            "cantidad": 1,
            "precio": 299.99
          }
        ],
        "precioTotal": 299.99,
        "estado": "enviado",
        "numFactura": 1003,
        "subprecio": 299.99,
        "iva": 63.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const facturas = pedidos.map(p => p.numFactura);
      expect(facturas[0]).toBe(1001);
      expect(facturas[1]).toBe(1002);
      expect(facturas[2]).toBe(1003);
      expect(new Set(facturas).size).toBe(facturas.length);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe convertir fechas correctamente a objetos Date', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos[0].fecha.getFullYear()).toBe(2025);
      expect(pedidos[0].fecha.getMonth()).toBe(10);
      expect(pedidos[0].fecha.getDate()).toBe(20);
      expect(pedidos[1].fecha.getFullYear()).toBe(2025);
      expect(pedidos[1].fecha.getMonth()).toBe(10);
      expect(pedidos[1].fecha.getDate()).toBe(22);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con diferentes rangos de precios', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      },
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      expect(pedidos[0].precioTotal).toBeLessThan(pedidos[1].precioTotal);
      expect(pedidos[0].precioTotal).toBe(129.99);
      expect(pedidos[1].precioTotal).toBe(899.99);
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe validar estructura completa de productos en el pedido', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          },
          {
            "idProducto": 4,
            "cantidad": 1,
            "precio": 69.99
          }
        ],
        "precioTotal": 199.98,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 199.98,
        "iva": 42.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const productos = pedidos[0].listaProductos;
      productos.forEach(producto => {
        expect(producto.idProducto).toBeDefined();
        expect(producto.cantidad).toBeDefined();
        expect(producto.precio).toBeDefined();
        expect(typeof producto.idProducto).toBe('number');
        expect(typeof producto.cantidad).toBe('number');
        expect(typeof producto.precio).toBe('number');
      });
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe validar que todos los campos requeridos estén presentes', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const pedido = pedidos[0];
      expect(pedido.id).toBeDefined();
      expect(pedido.idUsuario).toBeDefined();
      expect(pedido.fecha).toBeDefined();
      expect(pedido.listaProductos).toBeDefined();
      expect(pedido.precioTotal).toBeDefined();
      expect(pedido.estado).toBeDefined();
      expect(pedido.numFactura).toBeDefined();
      expect(pedido.subprecio).toBeDefined();
      expect(pedido.iva).toBeDefined();
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe realizar una única petición HTTP GET', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      }
    ];

    service.obtenerPedidos().subscribe();

    const requests = httpMock.match('assets/data/pedidos.json');
    expect(requests.length).toBe(1);
    expect(requests[0].request.method).toBe('GET');

    requests[0].flush(mockPedidos);
  });

  it('debe manejar pedidos ordenados cronológicamente', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      },
      {
        "id": 3,
        "idUsuario": 6,
        "fecha": "2025-11-23" as any,
        "listaProductos": [
          {
            "idProducto": 2,
            "cantidad": 1,
            "precio": 299.99
          }
        ],
        "precioTotal": 299.99,
        "estado": "enviado",
        "numFactura": 1003,
        "subprecio": 299.99,
        "iva": 63.00
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      for (let i = 0; i < pedidos.length - 1; i++) {
        expect(pedidos[i].fecha.getTime()).toBeLessThanOrEqual(pedidos[i + 1].fecha.getTime());
      }
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });

  it('debe manejar pedidos con múltiples estados simultáneamente', () => {
    const mockPedidos: Pedido[] = [
      {
        "id": 1,
        "idUsuario": 2,
        "fecha": "2025-11-20" as any,
        "listaProductos": [
          {
            "idProducto": 1,
            "cantidad": 1,
            "precio": 899.99
          }
        ],
        "precioTotal": 899.99,
        "estado": "entregado",
        "numFactura": 1001,
        "subprecio": 899.99,
        "iva": 189.00
      },
      {
        "id": 2,
        "idUsuario": 4,
        "fecha": "2025-11-22" as any,
        "listaProductos": [
          {
            "idProducto": 3,
            "cantidad": 1,
            "precio": 129.99
          }
        ],
        "precioTotal": 129.99,
        "estado": "enviado",
        "numFactura": 1002,
        "subprecio": 129.99,
        "iva": 27.30
      },
      {
        "id": 4,
        "idUsuario": 9,
        "fecha": "2025-11-24" as any,
        "listaProductos": [
          {
            "idProducto": 5,
            "cantidad": 1,
            "precio": 649.99
          }
        ],
        "precioTotal": 649.99,
        "estado": "pendiente",
        "numFactura": 1004,
        "subprecio": 649.99,
        "iva": 136.50
      }
    ];

    service.obtenerPedidos().subscribe((pedidos) => {
      const estados = pedidos.map(p => p.estado);
      expect(estados).toContain("entregado");
      expect(estados).toContain("enviado");
      expect(estados).toContain("pendiente");
    });

    const req = httpMock.expectOne('assets/data/pedidos.json');
    req.flush(mockPedidos);
  });
});
