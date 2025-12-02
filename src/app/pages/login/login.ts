import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import emailjs from '@emailjs/browser';
import { UsuariosService } from '../../services/usuarios/usuarios-service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  cargando: boolean = false;
  error: string = "";

  email: string = "";
  clave: string = "";

  restablecer: boolean = false;
  estadoRestablecerClave: string = "";

  constructor(
    private servicio: UsuariosService,
    private router: Router,
  ) { }

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

  onLogin() {
    this.cargando = true;
    let listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) {
      this.error = "Error: lista de usuarios no existente, recargando página ...";
      setTimeout(() => {
        location.reload();
      }, 3000);
      return;
    }
    let listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    let usuario = listaUsuarios.find(u =>
      u.email.toLowerCase() == this.email.toLowerCase() &&
      u.clave == btoa(this.clave)
    );
    if (!usuario) {
      this.cargando = false;
      this.error = "Email y/o clave incorrectos";
      return;
    }
    this.cargando = false;
    localStorage.setItem("token", this.servicio.crearToken(usuario));
    this.router.navigate(['/home']);
  }

  cambiarEstado() {
    this.restablecer = !this.restablecer;
    this.error = "";
    this.estadoRestablecerClave = "";
  }

  recuperarClave() {
    this.error = "";
    this.estadoRestablecerClave = "";

    if (!this.email || !this.email.trim()) {
      this.error = "Por favor, ingresa tu email";
      return;
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = "Por favor, ingresa un email válido";
      return;
    }

    this.cargando = true;
    let tokenRestablecimiento = this.servicio.crearTokenRestablecerClave(this.email);
    const templateParams = {
      email: this.email,
      urlWeb: "https://kompu.vercel.app",
      urlLogo: "https://kompu.vercel.app/assets/images/icons/kompu.png",
      urlLink: "https://kompu.vercel.app/restablecimiento?tokenR=" + tokenRestablecimiento
    };
    emailjs.send(
      'servicio_correo_kompu',
      'plantilla_resetear_clave',
      templateParams,
      'UXLui2Yw1nIYtD-OL'
    ).then(() => {
      this.cargando = false;
      this.estadoRestablecerClave = "Correo enviado exitosamente. Revisa tu bandeja de entrada.";
    }).catch(() => {
      this.cargando = false;
      this.error = "Error al enviar el correo. Intenta nuevamente.";
    });
  }
}