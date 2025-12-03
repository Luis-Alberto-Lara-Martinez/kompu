import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Login } from './login';
import { UsuariosService } from '../../services/usuarios/usuarios-service';

class UsuariosServiceMock {
  obtenerUsuarios = vi.fn(() => of([]));
  crearToken = vi.fn((usuario: any) => {
    const payload = { id: usuario.id, exp: Math.floor(Date.now() / 1000) + 3600 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
  });
  crearTokenRestablecerClave = vi.fn((email: string) => `token-${email}`);
}

const emailjsMock = { send: vi.fn() };

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let usuariosService: UsuariosServiceMock;

  beforeEach(async () => {
    usuariosService = new UsuariosServiceMock();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: UsuariosService, useValue: usuariosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
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

  describe('onLogin', () => {
    it('muestra error si no existe listaUsuarios', () => {
      localStorage.removeItem('listaUsuarios');

      component.onLogin();
      expect(component.error).toContain('lista de usuarios no existente');
      expect(component.cargando).toBe(true);
    });

    it('muestra error si credenciales incorrectas', () => {
      localStorage.setItem('listaUsuarios', JSON.stringify([
        { id: 1, email: 'user@mail.com', clave: btoa('pass'), estado: 'activado' }
      ]));
      component.email = 'otro@mail.com';
      component.clave = 'otra';

      component.onLogin();
      expect(component.error).toBe('Email y/o clave incorrectos');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('navega a /home y guarda token si credenciales correctas', () => {
      const usuario = { id: 1, email: 'user@mail.com', clave: btoa('pass'), estado: 'activado' };
      localStorage.setItem('listaUsuarios', JSON.stringify([usuario]));
      component.email = 'user@mail.com';
      component.clave = 'pass';

      component.onLogin();
      expect(localStorage.getItem('token')).toContain('header.');
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('cambiarEstado', () => {
    it('alterna restablecer y limpia mensajes', () => {
      component.restablecer = false;
      component.error = 'x';
      component.estadoRestablecerClave = 'y';

      component.cambiarEstado();
      expect(component.restablecer).toBe(true);
      expect(component.error).toBe('');
      expect(component.estadoRestablecerClave).toBe('');
    });
  });

  describe('recuperarClave', () => {
    it('valida email vacío', () => {
      component.email = '';
      component.recuperarClave();
      expect(component.error).toBe('Por favor, ingresa tu email');
    });

    it('valida formato email incorrecto', () => {
      component.email = 'incorrecto';
      component.recuperarClave();
      expect(component.error).toBe('Por favor, ingresa un email válido');
    });

    it('envía correo correctamente', async () => {
      component.email = 'user@mail.com';
      const sendMock = vi.fn(() => Promise.resolve());
      (globalThis as any).emailjs = { send: sendMock };

      component.recuperarClave();

      await vi.waitFor(() => {
        expect(component.cargando).toBe(false);
      });

      expect(sendMock).toHaveBeenCalled();
      expect(component.estadoRestablecerClave).toContain('Correo enviado');
      expect(component.error).toBe('');
    });

    it('maneja error al enviar correo', async () => {
      component.email = 'user@mail.com';
      const sendMock = vi.fn(() => Promise.reject('error'));
      (globalThis as any).emailjs = { send: sendMock };

      component.recuperarClave();

      await vi.waitFor(() => {
        expect(component.cargando).toBe(false);
      });

      expect(sendMock).toHaveBeenCalled();
      expect(component.error).toBe('Error al enviar el correo. Intenta nuevamente.');
      expect(component.estadoRestablecerClave).toBe('');
    });
  });
});
