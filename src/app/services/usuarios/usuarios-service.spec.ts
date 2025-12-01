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

  // ---------------------------------------------------
  // TEST obtenerUsuarios()
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // TEST crearTokenRestablecerClave()
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // TEST crearToken()
  // ---------------------------------------------------
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

});
