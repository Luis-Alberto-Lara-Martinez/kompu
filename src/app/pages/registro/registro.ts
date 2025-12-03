import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { UsuariosService } from '../../services/usuarios/usuarios-service';
import * as emailjsImport from '@emailjs/browser';

@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  cargando: boolean = false;
  error: string = '';

  nombre: string = '';
  email: string = '';
  clave: string = '';
  confirmarClave: string = '';
  telefono: string = '';
  direccion: string = '';

  constructor(private servicio: UsuariosService, private router: Router) { }

  ngOnInit() {
    if (typeof window == "undefined") return;
    let tokenString = localStorage.getItem("token");
    if (tokenString) {
      try {
        let payload = JSON.parse(atob(tokenString.split(".")[1]));
        if (payload.exp > Math.floor(Date.now() / 1000)) {
          this.router.navigate(['/home']);
          return;
        }
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
    let listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) {
      this.servicio.obtenerUsuarios().subscribe({
        next: listaUsuarios => {
          localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
        }
      });
    }
  }

  onRegister() {
    this.error = '';

    const nombre = this.nombre.trim();
    const email = this.email.trim();
    const clave = this.clave.trim();
    const confirmarClave = this.confirmarClave.trim();
    const telefono = this.telefono.trim();
    const direccion = this.direccion.trim();

    if (!nombre || !email || !clave || !confirmarClave || !telefono || !direccion) {
      this.error = 'Todos los campos deben ser completados';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.error = 'Por favor, ingresa un email válido';
      return;
    }

    if (clave !== confirmarClave) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const claveRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!claveRegex.test(clave)) {
      this.error = "La contraseña debe tener al menos 6 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales";
      return;
    }

    this.cargando = true;

    let listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) {
      this.error = "Error: lista de usuarios no disponible, recargando página...";
      setTimeout(() => {
        location.reload();
      }, 3000);
      return;
    }

    let listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    let usuario = listaUsuarios.find(u =>
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (usuario) {
      this.cargando = false;
      this.error = 'Este email ya está registrado';
      return;
    }

    let nuevoUsuario: Usuario = {
      id: listaUsuarios.length + 1,
      nombre,
      email: email.toLowerCase(),
      clave: btoa(clave),
      telefono,
      direccion,
      rol: 'usuario',
      estado: 'activado',
      carrito: [],
      listaDeseos: []
    };

    listaUsuarios.push(nuevoUsuario);
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    localStorage.setItem("token", this.servicio.crearToken(nuevoUsuario));

    const templateParams = {
      email: nuevoUsuario.email,
      nombre: nuevoUsuario.nombre,
      urlWeb: "https://kompu.vercel.app",
      urlLogo: "https://kompu.vercel.app/assets/images/icons/kompu.png",
    };
    const emailjs = (globalThis as any).emailjs || emailjsImport.default;
    return emailjs.send(
      'servicio_correo_kompu',
      'plantilla_bienvenida',
      templateParams,
      'UXLui2Yw1nIYtD-OL'
    ).then(() => {
      this.cargando = false;
      this.router.navigate(['/home']);
    }).catch(() => {
      this.cargando = false;
      this.error = "Error al enviar el correo. Intenta nuevamente.";
    });
  }
}