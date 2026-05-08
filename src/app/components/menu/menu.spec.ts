import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {vi} from 'vitest';
import {Menu} from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let router: Router;
  let mockLocalStorage: { [key: string]: string };

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
      imports: [Menu],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería redirigir a login cuando no hay token', () => {
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería redirigir a login cuando el token ha expirado', () => {
    const expiredPayload = {
      userName: 'testUser',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) - 3600
    };
    const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
    mockLocalStorage['token'] = expiredToken;

    component.ngOnInit();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería establecer esAdministrador en true para rol administrador', () => {
    const adminPayload = {
      userName: 'admin',
      rol: 'administrador',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const adminToken = `header.${btoa(JSON.stringify(adminPayload))}.signature`;
    mockLocalStorage['token'] = adminToken;

    component.ngOnInit();

    expect(component.esAdministrador).toBe(true);
    expect(component.userName).toBe('admin');
  });

  it('debería establecer esAdministrador en false para rol usuario', () => {
    const userPayload = {
      userName: 'usuario1',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const userToken = `header.${btoa(JSON.stringify(userPayload))}.signature`;
    mockLocalStorage['token'] = userToken;

    component.ngOnInit();

    expect(component.esAdministrador).toBe(false);
    expect(component.userName).toBe('usuario1');
  });

  it('debería mostrar el nombre de usuario correcto', () => {
    const payload = {
      userName: 'Juan García',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(component.userName).toBe('Juan García');
  });

  it('debería cerrar sesión y eliminar el token', () => {
    mockLocalStorage['token'] = 'test-token';

    component.cerrarSesion();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería redirigir a login aunque no haya token al cerrar sesión', () => {
    component.cerrarSesion();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería manejar token con payload válido pero sin campo exp', () => {
    const payloadSinExp = {
      userName: 'testUser',
      rol: 'usuario'
    };
    const tokenSinExp = `header.${btoa(JSON.stringify(payloadSinExp))}.signature`;
    mockLocalStorage['token'] = tokenSinExp;

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería manejar token válido próximo a expirar', () => {
    const payload = {
      userName: 'testUser',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) + 60
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(component.userName).toBe('testUser');
    expect(component.esAdministrador).toBe(false);
  });

  it('debería manejar diferentes roles de usuario', () => {
    const payload = {
      userName: 'otroUsuario',
      rol: 'invitado',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(component.esAdministrador).toBe(false);
  });

  it('debería validar token con tiempo de expiración exacto', () => {
    const payload = {
      userName: 'testUser',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000)
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería manejar múltiples llamadas a ngOnInit', () => {
    const payload = {
      userName: 'testUser',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();
    const firstUserName = component.userName;

    component.ngOnInit();

    expect(component.userName).toBe(firstUserName);
  });

  it('debería manejar token con caracteres especiales en userName', () => {
    const payload = {
      userName: 'José María Ñoño',
      rol: 'usuario',
      exp: Math.floor(Date.now() / 1000) + 18000
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(component.userName).toBe('José María Ñoño');
  });

  it('debería manejar token de larga duración', () => {
    const payload = {
      userName: 'testUser',
      rol: 'administrador',
      exp: Math.floor(Date.now() / 1000) + 86400
    };
    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    mockLocalStorage['token'] = token;

    component.ngOnInit();

    expect(component.esAdministrador).toBe(true);
    expect(component.userName).toBe('testUser');
  });
});
