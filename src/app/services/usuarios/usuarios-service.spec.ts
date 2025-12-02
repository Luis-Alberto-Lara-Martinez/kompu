import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios-service';
import { Usuario } from '../../models/usuario';
import { provideHttpClient } from '@angular/common/http';

describe('UsuariosService', () => {

  let service: UsuariosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuariosService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener usuarios y codificar sus claves en base64', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "Juan Pérez",
        "email": "juan.perez@gmail.com",
        "clave": "Admin1234-",
        "telefono": "612345678",
        "direccion": "Calle Mayor 123, Madrid",
        "rol": "administrador",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      },
      {
        "id": 2,
        "nombre": "María García",
        "email": "maria.garcia@gmail.com",
        "clave": "Cliente123@",
        "telefono": "623456789",
        "direccion": "Avenida Diagonal 456, Barcelona",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [
          {
            "idProducto": 2,
            "cantidad": 1
          },
          {
            "idProducto": 3,
            "cantidad": 2
          }
        ],
        "listaDeseos": [
          1,
          5,
          7
        ]
      },
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios.length).toBe(2);
      expect(usuarios[0].clave).toBe(btoa("Admin1234-"));
      expect(usuarios[1].clave).toBe(btoa("Cliente123@"));
      expect(usuarios[0].nombre).toBe("Juan Pérez");
      expect(usuarios[1].nombre).toBe("María García");
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsuarios);
  });

  it('debe crear un token válido al restablecer clave', () => {
    const email = 'test@correo.com';
    const token = service.crearTokenRestablecerClave(email);

    const partes = token.split('.');
    expect(partes.length).toBe(3);

    const header = JSON.parse(atob(partes[0]));
    const payload = JSON.parse(atob(partes[1]));
    const firma = partes[2];

    expect(header.alg).toBe('HS256');
    expect(header.typ).toBe('JWT');

    expect(payload.email).toBe(email);
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    expect(firma).toBe(btoa((service as any).claveSecreta));
  });

  it('debe crear un token válido para un usuario', () => {
    const usuario: Usuario = {
      "id": 1,
      "nombre": "Luis Lara",
      "email": "luis.lara@gmail.com",
      "clave": "Test54321@",
      "telefono": "612345678",
      "direccion": "Calle Mayor 123, Madrid",
      "rol": "administrador",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const token = service.crearToken(usuario);

    const partes = token.split('.');
    expect(partes.length).toBe(3);

    const header = JSON.parse(atob(partes[0]));
    const payload = JSON.parse(atob(partes[1]));
    const firma = partes[2];

    expect(header.alg).toBe('HS256');
    expect(header.typ).toBe('JWT');

    expect(payload.id).toBe(usuario.id);
    expect(payload.userName).toBe(usuario.nombre);
    expect(payload.rol).toBe(usuario.rol);
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    expect(firma).toBe(btoa((service as any).claveSecreta));
  });

  it('debe crear token con rol usuario', () => {
    const usuario: Usuario = {
      "id": 5,
      "nombre": "Ana López",
      "email": "ana.lopez@gmail.com",
      "clave": "User123@",
      "telefono": "655555555",
      "direccion": "Calle Test 1",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const token = service.crearToken(usuario);
    const payload = JSON.parse(atob(token.split('.')[1]));

    expect(payload.rol).toBe('usuario');
    expect(payload.id).toBe(5);
    expect(payload.userName).toBe('Ana López');
  });

  it('debe crear token con usuario desactivado', () => {
    const usuario: Usuario = {
      "id": 10,
      "nombre": "Usuario Inactivo",
      "email": "inactivo@gmail.com",
      "clave": "Inactive123@",
      "telefono": "600000000",
      "direccion": "Dirección Test",
      "rol": "usuario",
      "estado": "desactivado",
      "carrito": [],
      "listaDeseos": []
    };

    const token = service.crearToken(usuario);
    expect(token).toBeTruthy();
    expect(token.split('.').length).toBe(3);
  });

  // ---------------------------------------------------
  // TEST obtenerUsuarios() - Casos adicionales
  // ---------------------------------------------------
  it('debe manejar lista vacía de usuarios', () => {
    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios).toEqual([]);
      expect(usuarios.length).toBe(0);
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush([]);
  });

  it('debe codificar correctamente múltiples usuarios con diferentes claves', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "User1",
        "email": "user1@test.com",
        "clave": "Pass1@",
        "telefono": "111111111",
        "direccion": "Dir 1",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      },
      {
        "id": 2,
        "nombre": "User2",
        "email": "user2@test.com",
        "clave": "Pass2@",
        "telefono": "222222222",
        "direccion": "Dir 2",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      },
      {
        "id": 3,
        "nombre": "User3",
        "email": "user3@test.com",
        "clave": "Pass3@",
        "telefono": "333333333",
        "direccion": "Dir 3",
        "rol": "administrador",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios.length).toBe(3);
      expect(usuarios[0].clave).toBe(btoa("Pass1@"));
      expect(usuarios[1].clave).toBe(btoa("Pass2@"));
      expect(usuarios[2].clave).toBe(btoa("Pass3@"));
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });

  it('debe mantener los datos del carrito al obtener usuarios', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "Usuario Con Carrito",
        "email": "carrito@test.com",
        "clave": "Test123@",
        "telefono": "666666666",
        "direccion": "Test Address",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [
          { "idProducto": 1, "cantidad": 3 },
          { "idProducto": 5, "cantidad": 1 }
        ],
        "listaDeseos": [2, 4, 6]
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios[0].carrito.length).toBe(2);
      expect(usuarios[0].carrito[0].idProducto).toBe(1);
      expect(usuarios[0].carrito[0].cantidad).toBe(3);
      expect(usuarios[0].listaDeseos).toEqual([2, 4, 6]);
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });

  it('debe preservar todos los campos del usuario excepto la clave', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 99,
        "nombre": "Test Complete",
        "email": "complete@test.com",
        "clave": "Original123@",
        "telefono": "999999999",
        "direccion": "Calle Completa 999",
        "rol": "administrador",
        "estado": "activado",
        "carrito": [{ "idProducto": 10, "cantidad": 5 }],
        "listaDeseos": [1, 2, 3]
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      const usuario = usuarios[0];
      expect(usuario.id).toBe(99);
      expect(usuario.nombre).toBe("Test Complete");
      expect(usuario.email).toBe("complete@test.com");
      expect(usuario.clave).toBe(btoa("Original123@"));
      expect(usuario.telefono).toBe("999999999");
      expect(usuario.direccion).toBe("Calle Completa 999");
      expect(usuario.rol).toBe("administrador");
      expect(usuario.estado).toBe("activado");
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });

  // ---------------------------------------------------
  // TEST crearTokenRestablecerClave() - Casos adicionales
  // ---------------------------------------------------
  it('debe crear token de restablecimiento con diferentes emails', () => {
    const emails = [
      'test1@correo.com',
      'user@example.com',
      'admin@domain.org'
    ];

    emails.forEach(email => {
      const token = service.crearTokenRestablecerClave(email);
      const payload = JSON.parse(atob(token.split('.')[1]));
      expect(payload.email).toBe(email);
    });
  });

  it('debe crear token con tiempo de expiración de 5 horas', () => {
    const email = 'expiracion@test.com';
    const tiempoAntes = Math.floor(Date.now() / 1000);

    const token = service.crearTokenRestablecerClave(email);
    const payload = JSON.parse(atob(token.split('.')[1]));

    const tiempoDespues = Math.floor(Date.now() / 1000);
    const cincoHoras = 5 * 3600;

    expect(payload.exp).toBeGreaterThanOrEqual(tiempoAntes + cincoHoras);
    expect(payload.exp).toBeLessThanOrEqual(tiempoDespues + cincoHoras + 1);
  });

  it('debe crear token de restablecimiento con estructura JWT correcta', () => {
    const token = service.crearTokenRestablecerClave('estructura@test.com');

    expect(token).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);

    const partes = token.split('.');
    expect(partes.length).toBe(3);
    expect(partes[0]).toBeTruthy();
    expect(partes[1]).toBeTruthy();
    expect(partes[2]).toBeTruthy();
  });

  it('debe crear tokens diferentes para emails diferentes', () => {
    const token1 = service.crearTokenRestablecerClave('email1@test.com');
    const token2 = service.crearTokenRestablecerClave('email2@test.com');

    expect(token1).not.toBe(token2);

    const payload1 = JSON.parse(atob(token1.split('.')[1]));
    const payload2 = JSON.parse(atob(token2.split('.')[1]));

    expect(payload1.email).not.toBe(payload2.email);
  });

  // ---------------------------------------------------
  // TEST crearToken() - Casos límite y especiales
  // ---------------------------------------------------
  it('debe crear tokens únicos para diferentes usuarios', () => {
    const usuario1: Usuario = {
      "id": 1,
      "nombre": "User1",
      "email": "user1@test.com",
      "clave": "Pass1@",
      "telefono": "111111111",
      "direccion": "Dir 1",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const usuario2: Usuario = {
      "id": 2,
      "nombre": "User2",
      "email": "user2@test.com",
      "clave": "Pass2@",
      "telefono": "222222222",
      "direccion": "Dir 2",
      "rol": "administrador",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const token1 = service.crearToken(usuario1);
    const token2 = service.crearToken(usuario2);

    expect(token1).not.toBe(token2);

    const payload1 = JSON.parse(atob(token1.split('.')[1]));
    const payload2 = JSON.parse(atob(token2.split('.')[1]));

    expect(payload1.id).toBe(1);
    expect(payload2.id).toBe(2);
    expect(payload1.rol).toBe('usuario');
    expect(payload2.rol).toBe('administrador');
  });

  it('debe incluir tiempo de expiración de 5 horas en token de usuario', () => {
    const usuario: Usuario = {
      "id": 1,
      "nombre": "Test Exp",
      "email": "exp@test.com",
      "clave": "Test123@",
      "telefono": "123456789",
      "direccion": "Test",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const tiempoAntes = Math.floor(Date.now() / 1000);
    const token = service.crearToken(usuario);
    const tiempoDespues = Math.floor(Date.now() / 1000);

    const payload = JSON.parse(atob(token.split('.')[1]));
    const cincoHoras = 5 * 3600;

    expect(payload.exp).toBeGreaterThanOrEqual(tiempoAntes + cincoHoras);
    expect(payload.exp).toBeLessThanOrEqual(tiempoDespues + cincoHoras + 1);
  });

  it('debe mantener la firma consistente con la clave secreta', () => {
    const usuario: Usuario = {
      "id": 1,
      "nombre": "Test",
      "email": "test@test.com",
      "clave": "Test123@",
      "telefono": "123456789",
      "direccion": "Test",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const token1 = service.crearToken(usuario);
    const token2 = service.crearToken(usuario);

    const firma1 = token1.split('.')[2];
    const firma2 = token2.split('.')[2];

    expect(firma1).toBe(firma2);
    expect(firma1).toBe(btoa((service as any).claveSecreta));
  });

  it('debe crear token con usuario que tiene carrito y lista de deseos', () => {
    const usuario: Usuario = {
      "id": 15,
      "nombre": "Usuario Completo",
      "email": "completo@test.com",
      "clave": "Complete123@",
      "telefono": "987654321",
      "direccion": "Calle Completa",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [
        { "idProducto": 1, "cantidad": 2 },
        { "idProducto": 3, "cantidad": 1 }
      ],
      "listaDeseos": [5, 10, 15]
    };

    const token = service.crearToken(usuario);
    const payload = JSON.parse(atob(token.split('.')[1]));

    expect(payload.id).toBe(15);
    expect(payload.userName).toBe("Usuario Completo");
    expect(payload.rol).toBe("usuario");
  });

  it('debe verificar estructura completa del header en todos los tokens', () => {
    const usuario: Usuario = {
      "id": 1,
      "nombre": "Header Test",
      "email": "header@test.com",
      "clave": "Test123@",
      "telefono": "123456789",
      "direccion": "Test",
      "rol": "usuario",
      "estado": "activado",
      "carrito": [],
      "listaDeseos": []
    };

    const tokenUsuario = service.crearToken(usuario);
    const tokenReset = service.crearTokenRestablecerClave('test@correo.com');

    const headerUsuario = JSON.parse(atob(tokenUsuario.split('.')[0]));
    const headerReset = JSON.parse(atob(tokenReset.split('.')[0]));

    expect(headerUsuario).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(headerReset).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('debe codificar correctamente claves con caracteres especiales', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "Usuario Especial",
        "email": "especial@test.com",
        "clave": "P@ssw0rd!#$%&",
        "telefono": "123456789",
        "direccion": "Test",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios[0].clave).toBe(btoa("P@ssw0rd!#$%&"));
      expect(atob(usuarios[0].clave)).toBe("P@ssw0rd!#$%&");
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });

  it('debe manejar usuarios con todos los estados posibles', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "Activado",
        "email": "activado@test.com",
        "clave": "Test123@",
        "telefono": "111111111",
        "direccion": "Test",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      },
      {
        "id": 2,
        "nombre": "Desactivado",
        "email": "desactivado@test.com",
        "clave": "Test123@",
        "telefono": "222222222",
        "direccion": "Test",
        "rol": "usuario",
        "estado": "desactivado",
        "carrito": [],
        "listaDeseos": []
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios[0].estado).toBe("activado");
      expect(usuarios[1].estado).toBe("desactivado");
      expect(usuarios.length).toBe(2);
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });

  it('debe manejar usuarios con ambos roles', () => {
    const mockUsuarios: Usuario[] = [
      {
        "id": 1,
        "nombre": "Admin",
        "email": "admin@test.com",
        "clave": "Admin123@",
        "telefono": "111111111",
        "direccion": "Test",
        "rol": "administrador",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      },
      {
        "id": 2,
        "nombre": "User",
        "email": "user@test.com",
        "clave": "User123@",
        "telefono": "222222222",
        "direccion": "Test",
        "rol": "usuario",
        "estado": "activado",
        "carrito": [],
        "listaDeseos": []
      }
    ];

    service.obtenerUsuarios().subscribe((usuarios) => {
      expect(usuarios[0].rol).toBe("administrador");
      expect(usuarios[1].rol).toBe("usuario");
    });

    const req = httpMock.expectOne('assets/data/usuarios.json');
    req.flush(mockUsuarios);
  });
});