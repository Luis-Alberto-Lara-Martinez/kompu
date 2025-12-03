import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Registro } from './registro';
import { UsuariosService } from '../../services/usuarios/usuarios-service';

class UsuariosServiceMock {
  obtenerUsuarios = vi.fn(() => of([]));
  crearToken = vi.fn((usuario: any) => {
    const payload = { id: usuario.id, exp: Math.floor(Date.now() / 1000) + 3600 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
  });
}

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let router: Router;
  let usuariosService: UsuariosServiceMock;

  beforeEach(async () => {
    usuariosService = new UsuariosServiceMock();

    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideRouter([]),
        { provide: UsuariosService, useValue: usuariosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    localStorage.clear();
    delete (globalThis as any).emailjs;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('redirige a /home si el token es válido', () => {
      const payload = { id: 1, exp: Math.floor(Date.now() / 1000) + 60 };
      localStorage.setItem('token', `h.${btoa(JSON.stringify(payload))}.s`);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('elimina token inválido y no navega', () => {
      localStorage.setItem('token', 'token-invalido');

      component.ngOnInit();

      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('carga listaUsuarios si no existe en localStorage', () => {
      localStorage.removeItem('listaUsuarios');
      usuariosService.obtenerUsuarios = vi.fn(() => of([{ id: 1 }] as any));

      component.ngOnInit();

      expect(localStorage.getItem('listaUsuarios')).toBe(JSON.stringify([{ id: 1 }]));
    });
  });

  describe('onRegister', () => {
    beforeEach(() => {
      localStorage.setItem('listaUsuarios', JSON.stringify([
        { id: 1, email: 'existente@mail.com', clave: btoa('Pass123!'), estado: 'activado' }
      ]));
    });

    it('muestra error si los campos están vacíos', () => {
      component.nombre = '';
      component.email = '';
      component.clave = '';
      component.confirmarClave = '';
      component.telefono = '';
      component.direccion = '';

      component.onRegister();

      expect(component.error).toBe('Todos los campos deben ser completados');
    });

    it('muestra error si el email no es válido', () => {
      component.nombre = 'Test User';
      component.email = 'email-invalido';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass123!';
      component.telefono = '123456789';
      component.direccion = 'Calle Test 123';

      component.onRegister();

      expect(component.error).toBe('Por favor, ingresa un email válido');
    });

    it('muestra error si las contraseñas no coinciden', () => {
      component.nombre = 'Test User';
      component.email = 'test@mail.com';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass456!';
      component.telefono = '123456789';
      component.direccion = 'Calle Test 123';

      component.onRegister();

      expect(component.error).toBe('Las contraseñas no coinciden');
    });

    it('muestra error si la contraseña no cumple el formato', () => {
      component.nombre = 'Test User';
      component.email = 'test@mail.com';
      component.clave = 'weak';
      component.confirmarClave = 'weak';
      component.telefono = '123456789';
      component.direccion = 'Calle Test 123';

      component.onRegister();

      expect(component.error).toContain('debe tener al menos 6 caracteres');
    });

    it('muestra error si no existe listaUsuarios', () => {
      localStorage.removeItem('listaUsuarios');
      component.nombre = 'Test User';
      component.email = 'test@mail.com';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass123!';
      component.telefono = '123456789';
      component.direccion = 'Calle Test 123';

      component.onRegister();

      expect(component.error).toContain('lista de usuarios no disponible');
      expect(component.cargando).toBe(true);
    });

    it('muestra error si el email ya está registrado', () => {
      component.nombre = 'Test User';
      component.email = 'existente@mail.com';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass123!';
      component.telefono = '123456789';
      component.direccion = 'Calle Test 123';

      component.onRegister();

      expect(component.error).toBe('Este email ya está registrado');
      expect(component.cargando).toBe(false);
    });

    it('registra el usuario correctamente y envía correo de bienvenida', async () => {
      const sendMock = vi.fn(() => Promise.resolve());
      (globalThis as any).emailjs = { send: sendMock };

      component.nombre = 'Nuevo Usuario';
      component.email = 'nuevo@mail.com';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass123!';
      component.telefono = '987654321';
      component.direccion = 'Av Nueva 456';

      await component.onRegister();

      const listaActualizada = JSON.parse(localStorage.getItem('listaUsuarios')!);
      expect(listaActualizada).toHaveLength(2);
      expect(listaActualizada[1].email).toBe('nuevo@mail.com');
      expect(listaActualizada[1].nombre).toBe('Nuevo Usuario');
      expect(listaActualizada[1].rol).toBe('usuario');
      expect(listaActualizada[1].estado).toBe('activado');
      expect(localStorage.getItem('token')).toContain('header.');
      expect(sendMock).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('maneja error al enviar correo de bienvenida', async () => {
      const sendMock = vi.fn(() => Promise.reject('error'));
      (globalThis as any).emailjs = { send: sendMock };

      component.nombre = 'Nuevo Usuario';
      component.email = 'nuevo@mail.com';
      component.clave = 'Pass123!';
      component.confirmarClave = 'Pass123!';
      component.telefono = '987654321';
      component.direccion = 'Av Nueva 456';

      await component.onRegister();

      expect(sendMock).toHaveBeenCalled();
      expect(component.error).toBe('Error al enviar el correo. Intenta nuevamente.');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('normaliza el email a minúsculas y trimea los campos', async () => {
      const sendMock = vi.fn(() => Promise.resolve());
      (globalThis as any).emailjs = { send: sendMock };

      component.nombre = '  Test User  ';
      component.email = '  TEST@MAIL.COM  ';
      component.clave = '  Pass123!  ';
      component.confirmarClave = '  Pass123!  ';
      component.telefono = '  123456789  ';
      component.direccion = '  Calle Test  ';

      await component.onRegister();

      const listaActualizada = JSON.parse(localStorage.getItem('listaUsuarios')!);
      const nuevoUsuario = listaActualizada[1];
      expect(nuevoUsuario.email).toBe('test@mail.com');
      expect(nuevoUsuario.nombre).toBe('Test User');
      expect(nuevoUsuario.telefono).toBe('123456789');
      expect(nuevoUsuario.direccion).toBe('Calle Test');
    });
  });
});
