import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ProductosService} from './productos-service';
import {Producto} from '../../models/producto';
import {provideHttpClient} from '@angular/common/http';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductosService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener productos y convertir fechaLanzamiento a Date', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Portátil ASUS TUF Gaming FA808UM-S8005",
        "marca": "Asus",
        "categoria": "Portátiles",
        "precio": 1099.99,
        "stock": 15,
        "listaImagenes": ["assets/images/products/portatil-asus-1.webp"],
        "descripcion": "Portátil gaming Intel Core i5, 16GB RAM, 512GB SSD, RTX 3050",
        "valoraciones": [
          {
            "idUsuario": 2,
            "nota": 5,
            "comentario": "Excelente portátil, funciona perfecto para juegos"
          }
        ],
        "fechaLanzamiento": "2023-09-15" as any
      },
      {
        "id": 2,
        "nombre": "Monitor LG UltraGear 27\"",
        "marca": "LG",
        "categoria": "Monitores",
        "precio": 299.99,
        "stock": 8,
        "listaImagenes": ["assets/images/monitor-lg-1.jpg"],
        "descripcion": "Monitor gaming 27 pulgadas QHD 165Hz",
        "valoraciones": [],
        "fechaLanzamiento": "2022-11-20" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos.length).toBe(2);
      expect(productos[0].fechaLanzamiento instanceof Date).toBe(true);
      expect(productos[1].fechaLanzamiento instanceof Date).toBe(true);
      expect(productos[0].nombre).toBe("Portátil ASUS TUF Gaming FA808UM-S8005");
      expect(productos[0].stock).toBe(15);
      expect(productos[1].stock).toBe(8);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockProductos);
  });

  it('debe manejar lista vacía de productos', () => {
    service.obtenerProductos().subscribe((productos) => {
      expect(productos).toEqual([]);
      expect(productos.length).toBe(0);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush([]);
  });

  it('debe preservar todos los campos del producto incluyendo stock', () => {
    const mockProductos: Producto[] = [
      {
        "id": 5,
        "nombre": "Tarjeta Gráfica RTX 4070",
        "marca": "MSI",
        "categoria": "Componentes",
        "precio": 649.99,
        "stock": 5,
        "listaImagenes": ["assets/images/rtx4070-msi-1.jpg", "assets/images/rtx4070-msi-2.jpg"],
        "descripcion": "Tarjeta gráfica NVIDIA RTX 4070 12GB",
        "valoraciones": [
          {
            "idUsuario": 9,
            "nota": 5,
            "comentario": "Potencia increíble, corre todos los juegos en ultra"
          }
        ],
        "fechaLanzamiento": "2023-04-12" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      const producto = productos[0];
      expect(producto.id).toBe(5);
      expect(producto.nombre).toBe("Tarjeta Gráfica RTX 4070");
      expect(producto.marca).toBe("MSI");
      expect(producto.categoria).toBe("Componentes");
      expect(producto.precio).toBe(649.99);
      expect(producto.stock).toBe(5);
      expect(producto.listaImagenes.length).toBe(2);
      expect(producto.descripcion).toBe("Tarjeta gráfica NVIDIA RTX 4070 12GB");
      expect(producto.valoraciones.length).toBe(1);
      expect(producto.fechaLanzamiento instanceof Date).toBe(true);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con diferentes niveles de stock', () => {
    const mockProductos: Producto[] = [
      {
        "id": 15,
        "nombre": "Tarjeta Gráfica RTX 4080",
        "marca": "MSI",
        "categoria": "Componentes",
        "precio": 899.99,
        "stock": 3,
        "listaImagenes": ["assets/images/rtx4080-msi-1.jpg"],
        "descripcion": "Tarjeta gráfica NVIDIA RTX 4080 16GB",
        "valoraciones": [],
        "fechaLanzamiento": "2023-07-01" as any
      },
      {
        "id": 17,
        "nombre": "Memoria RAM 16GB DDR4",
        "marca": "Kingston",
        "categoria": "Componentes",
        "precio": 79.99,
        "stock": 35,
        "listaImagenes": ["assets/images/ram-kingston-1.jpg"],
        "descripcion": "Kit RAM 16GB DDR4 3200MHz",
        "valoraciones": [],
        "fechaLanzamiento": "2022-10-10" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].stock).toBe(3);
      expect(productos[1].stock).toBe(35);
      expect(productos[0].categoria).toBe("Componentes");
      expect(productos[1].categoria).toBe("Componentes");
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos de categoría Portátiles con stock medio', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Portátil ASUS TUF Gaming FA808UM-S8005",
        "marca": "Asus",
        "categoria": "Portátiles",
        "precio": 1099.99,
        "stock": 15,
        "listaImagenes": ["assets/images/products/portatil-asus-1.webp"],
        "descripcion": "Portátil gaming Intel Core i5, 16GB RAM, 512GB SSD, RTX 3050",
        "valoraciones": [],
        "fechaLanzamiento": "2023-09-15" as any
      },
      {
        "id": 11,
        "nombre": "Portátil Dell Inspiron 15",
        "marca": "Dell",
        "categoria": "Portátiles",
        "precio": 999.99,
        "stock": 10,
        "listaImagenes": ["assets/images/portatil-dell-1.jpg"],
        "descripcion": "Portátil Dell i7, 16GB RAM, 512GB SSD",
        "valoraciones": [],
        "fechaLanzamiento": "2023-08-10" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      productos.forEach(producto => {
        expect(producto.categoria).toBe("Portátiles");
        expect(producto.stock).toBeGreaterThanOrEqual(10);
        expect(producto.stock).toBeLessThanOrEqual(15);
      });
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos de categoría Monitores', () => {
    const mockProductos: Producto[] = [
      {
        "id": 2,
        "nombre": "Monitor LG UltraGear 27\"",
        "marca": "LG",
        "categoria": "Monitores",
        "precio": 299.99,
        "stock": 8,
        "listaImagenes": ["assets/images/monitor-lg-1.jpg"],
        "descripcion": "Monitor gaming 27 pulgadas QHD 165Hz",
        "valoraciones": [],
        "fechaLanzamiento": "2022-11-20" as any
      },
      {
        "id": 12,
        "nombre": "Monitor Samsung Odyssey 32\"",
        "marca": "Samsung",
        "categoria": "Monitores",
        "precio": 399.99,
        "stock": 6,
        "listaImagenes": ["assets/images/monitor-samsung-1.jpg"],
        "descripcion": "Monitor gaming 32 pulgadas QHD 240Hz",
        "valoraciones": [],
        "fechaLanzamiento": "2023-06-25" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      productos.forEach(producto => {
        expect(producto.categoria).toBe("Monitores");
        expect(producto.nombre).toContain("Monitor");
      });
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos de categoría Periféricos con alto stock', () => {
    const mockProductos: Producto[] = [
      {
        "id": 3,
        "nombre": "Teclado Mecánico Logitech",
        "marca": "Logitech",
        "categoria": "Periféricos",
        "precio": 129.99,
        "stock": 25,
        "listaImagenes": ["assets/images/teclado-logitech-1.jpg"],
        "descripcion": "Teclado mecánico RGB gaming",
        "valoraciones": [],
        "fechaLanzamiento": "2021-05-10" as any
      },
      {
        "id": 4,
        "nombre": "Ratón Razer DeathAdder",
        "marca": "Razer",
        "categoria": "Periféricos",
        "precio": 69.99,
        "stock": 30,
        "listaImagenes": ["assets/images/raton-razer-1.jpg"],
        "descripcion": "Ratón gaming ergonómico RGB",
        "valoraciones": [],
        "fechaLanzamiento": "2020-08-01" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      productos.forEach(producto => {
        expect(producto.categoria).toBe("Periféricos");
        expect(producto.stock).toBeGreaterThanOrEqual(20);
      });
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con múltiples valoraciones', () => {
    const mockProductos: Producto[] = [
      {
        "id": 3,
        "nombre": "Teclado Mecánico Logitech",
        "marca": "Logitech",
        "categoria": "Periféricos",
        "precio": 129.99,
        "stock": 25,
        "listaImagenes": ["assets/images/teclado-logitech-1.jpg"],
        "descripcion": "Teclado mecánico RGB gaming",
        "valoraciones": [
          {
            "idUsuario": 9,
            "nota": 4,
            "comentario": "Muy bueno, las teclas son muy responsivas"
          },
          {
            "idUsuario": 2,
            "nota": 5,
            "comentario": "El mejor teclado que he tenido"
          }
        ],
        "fechaLanzamiento": "2021-05-10" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].valoraciones.length).toBe(2);
      expect(productos[0].valoraciones[0].nota).toBe(4);
      expect(productos[0].valoraciones[1].nota).toBe(5);
      expect(productos[0].valoraciones[0].comentario).toBeTruthy();
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos sin valoraciones', () => {
    const mockProductos: Producto[] = [
      {
        "id": 6,
        "nombre": "Procesador AMD Ryzen 7",
        "marca": "AMD",
        "categoria": "Componentes",
        "precio": 449.99,
        "stock": 12,
        "listaImagenes": ["assets/images/ryzen7-amd-1.jpg"],
        "descripcion": "Procesador AMD Ryzen 7 8 núcleos",
        "valoraciones": [],
        "fechaLanzamiento": "2022-02-01" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].valoraciones).toEqual([]);
      expect(productos[0].valoraciones.length).toBe(0);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con múltiples imágenes', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Portátil ASUS TUF Gaming FA808UM-S8005",
        "marca": "Asus",
        "categoria": "Portátiles",
        "precio": 1099.99,
        "stock": 15,
        "listaImagenes": [
          "assets/images/products/portatil-asus-1.webp",
          "assets/images/products/portatil-asus-2.webp",
          "assets/images/products/portatil-asus-3.webp",
          "assets/images/products/portatil-asus-5.webp"
        ],
        "descripcion": "Portátil gaming Intel Core i5, 16GB RAM, 512GB SSD, RTX 3050",
        "valoraciones": [],
        "fechaLanzamiento": "2023-09-15" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].listaImagenes.length).toBe(4);
      expect(productos[0].listaImagenes[0]).toContain("portatil-asus-1");
      expect(productos[0].listaImagenes[3]).toContain("portatil-asus-5");
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con una sola imagen', () => {
    const mockProductos: Producto[] = [
      {
        "id": 11,
        "nombre": "Portátil Dell Inspiron 15",
        "marca": "Dell",
        "categoria": "Portátiles",
        "precio": 999.99,
        "stock": 10,
        "listaImagenes": ["assets/images/portatil-dell-1.jpg"],
        "descripcion": "Portátil Dell i7, 16GB RAM, 512GB SSD",
        "valoraciones": [],
        "fechaLanzamiento": "2023-08-10" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].listaImagenes.length).toBe(1);
      expect(productos[0].listaImagenes[0]).toBe("assets/images/portatil-dell-1.jpg");
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos de categoría Almacenamiento', () => {
    const mockProductos: Producto[] = [
      {
        "id": 8,
        "nombre": "SSD Samsung 2TB",
        "marca": "Samsung",
        "categoria": "Almacenamiento",
        "precio": 179.99,
        "stock": 18,
        "listaImagenes": ["assets/images/ssd-samsung-1.jpg"],
        "descripcion": "SSD NVMe M.2 2TB alta velocidad",
        "valoraciones": [],
        "fechaLanzamiento": "2021-09-30" as any
      },
      {
        "id": 18,
        "nombre": "SSD Crucial 1TB",
        "marca": "Crucial",
        "categoria": "Almacenamiento",
        "precio": 119.99,
        "stock": 24,
        "listaImagenes": ["assets/images/ssd-crucial-1.jpg"],
        "descripcion": "SSD NVMe M.2 1TB alta velocidad",
        "valoraciones": [],
        "fechaLanzamiento": "2023-01-05" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      productos.forEach(producto => {
        expect(producto.categoria).toBe("Almacenamiento");
        expect(producto.nombre).toContain("SSD");
      });
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con diferentes marcas', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Portátil ASUS TUF Gaming",
        "marca": "Asus",
        "categoria": "Portátiles",
        "precio": 1099.99,
        "stock": 15,
        "listaImagenes": ["assets/images/products/portatil-asus-1.webp"],
        "descripcion": "Portátil gaming",
        "valoraciones": [],
        "fechaLanzamiento": "2023-09-15" as any
      },
      {
        "id": 2,
        "nombre": "Monitor LG UltraGear",
        "marca": "LG",
        "categoria": "Monitores",
        "precio": 299.99,
        "stock": 8,
        "listaImagenes": ["assets/images/monitor-lg-1.jpg"],
        "descripcion": "Monitor gaming",
        "valoraciones": [],
        "fechaLanzamiento": "2022-11-20" as any
      },
      {
        "id": 4,
        "nombre": "Ratón Razer DeathAdder",
        "marca": "Razer",
        "categoria": "Periféricos",
        "precio": 69.99,
        "stock": 30,
        "listaImagenes": ["assets/images/raton-razer-1.jpg"],
        "descripcion": "Ratón gaming",
        "valoraciones": [],
        "fechaLanzamiento": "2020-08-01" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      const marcas = productos.map(p => p.marca);
      expect(marcas).toContain("Asus");
      expect(marcas).toContain("LG");
      expect(marcas).toContain("Razer");
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe convertir fechas de lanzamiento correctamente', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Producto Reciente",
        "marca": "Test",
        "categoria": "Test",
        "precio": 100,
        "stock": 10,
        "listaImagenes": ["test.jpg"],
        "descripcion": "Test",
        "valoraciones": [],
        "fechaLanzamiento": "2023-09-15" as any
      },
      {
        "id": 2,
        "nombre": "Producto Antiguo",
        "marca": "Test",
        "categoria": "Test",
        "precio": 100,
        "stock": 10,
        "listaImagenes": ["test.jpg"],
        "descripcion": "Test",
        "valoraciones": [],
        "fechaLanzamiento": "2020-08-01" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].fechaLanzamiento.getFullYear()).toBe(2023);
      expect(productos[0].fechaLanzamiento.getMonth()).toBe(8);
      expect(productos[1].fechaLanzamiento.getFullYear()).toBe(2020);
      expect(productos[1].fechaLanzamiento.getMonth()).toBe(7);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos con precios variados', () => {
    const mockProductos: Producto[] = [
      {
        "id": 24,
        "nombre": "Ratón SteelSeries Rival 3",
        "marca": "SteelSeries",
        "categoria": "Periféricos",
        "precio": 49.99,
        "stock": 32,
        "listaImagenes": ["assets/images/raton-steelseries-1.jpg"],
        "descripcion": "Ratón gaming RGB con sensor óptico",
        "valoraciones": [],
        "fechaLanzamiento": "2023-06-05" as any
      },
      {
        "id": 1,
        "nombre": "Portátil ASUS TUF Gaming",
        "marca": "Asus",
        "categoria": "Portátiles",
        "precio": 1099.99,
        "stock": 15,
        "listaImagenes": ["assets/images/portatil-asus-1.webp"],
        "descripcion": "Portátil gaming",
        "valoraciones": [],
        "fechaLanzamiento": "2023-09-15" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      expect(productos[0].precio).toBe(49.99);
      expect(productos[1].precio).toBe(1099.99);
      expect(productos[0].precio).toBeLessThan(productos[1].precio);
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe realizar una única petición HTTP GET', () => {
    const mockProductos: Producto[] = [
      {
        "id": 1,
        "nombre": "Test",
        "marca": "Test",
        "categoria": "Test",
        "precio": 100,
        "stock": 10,
        "listaImagenes": ["test.jpg"],
        "descripcion": "Test",
        "valoraciones": [],
        "fechaLanzamiento": "2023-01-01" as any
      }
    ];

    service.obtenerProductos().subscribe();

    const requests = httpMock.match('assets/data/productos.json');
    expect(requests.length).toBe(1);
    expect(requests[0].request.method).toBe('GET');

    requests[0].flush(mockProductos);
  });

  it('debe validar que todos los campos requeridos estén presentes', () => {
    const mockProductos: Producto[] = [
      {
        "id": 5,
        "nombre": "Tarjeta Gráfica RTX 4070",
        "marca": "MSI",
        "categoria": "Componentes",
        "precio": 649.99,
        "stock": 5,
        "listaImagenes": ["assets/images/rtx4070-msi-1.jpg"],
        "descripcion": "Tarjeta gráfica NVIDIA RTX 4070 12GB",
        "valoraciones": [],
        "fechaLanzamiento": "2023-04-12" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      const producto = productos[0];
      expect(producto.id).toBeDefined();
      expect(producto.nombre).toBeDefined();
      expect(producto.marca).toBeDefined();
      expect(producto.categoria).toBeDefined();
      expect(producto.precio).toBeDefined();
      expect(producto.stock).toBeDefined();
      expect(producto.listaImagenes).toBeDefined();
      expect(producto.descripcion).toBeDefined();
      expect(producto.valoraciones).toBeDefined();
      expect(producto.fechaLanzamiento).toBeDefined();
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });

  it('debe manejar productos gaming con componentes de alto rendimiento', () => {
    const mockProductos: Producto[] = [
      {
        "id": 5,
        "nombre": "Tarjeta Gráfica RTX 4070",
        "marca": "MSI",
        "categoria": "Componentes",
        "precio": 649.99,
        "stock": 5,
        "listaImagenes": ["assets/images/rtx4070-msi-1.jpg"],
        "descripcion": "Tarjeta gráfica NVIDIA RTX 4070 12GB",
        "valoraciones": [],
        "fechaLanzamiento": "2023-04-12" as any
      },
      {
        "id": 15,
        "nombre": "Tarjeta Gráfica RTX 4080",
        "marca": "MSI",
        "categoria": "Componentes",
        "precio": 899.99,
        "stock": 3,
        "listaImagenes": ["assets/images/rtx4080-msi-1.jpg"],
        "descripcion": "Tarjeta gráfica NVIDIA RTX 4080 16GB",
        "valoraciones": [],
        "fechaLanzamiento": "2023-07-01" as any
      }
    ];

    service.obtenerProductos().subscribe((productos) => {
      productos.forEach(producto => {
        expect(producto.nombre).toContain("RTX");
        expect(producto.stock).toBeLessThanOrEqual(5);
        expect(producto.precio).toBeGreaterThan(600);
      });
    });

    const req = httpMock.expectOne('assets/data/productos.json');
    req.flush(mockProductos);
  });
});
