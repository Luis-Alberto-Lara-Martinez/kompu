import { Component } from '@angular/core';
import { UsuariosService } from '../../services/usuarios/usuarios-service';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-restablecimiento',
  imports: [FormsModule],
  templateUrl: './restablecimiento.html',
  styleUrl: './restablecimiento.css',
})
export class Restablecimiento {
  cargando: boolean = false;
  error: string = "";

  email: string = "";
  clave: string = "";

  restablecer: boolean = false;
  estadoRestablecerClave: string = "";

  constructor(private servicio: UsuariosService, private router: Router) { }

  ngOnInit() {

    if (typeof window == "undefined") return;
    let tokenString = localStorage.getItem("token");
    if (tokenString) {
      let payload = JSON.parse(atob(tokenString.split(".")[1]));
      if (payload.exp > Math.floor(Date.now() / 1000)) return;
      this.router.navigate(['/home']);
      return;
    }
    let listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) this.servicio.obtenerUsuarios().subscribe({
      next: listaUsuarios => {
        if (typeof window !== 'undefined') localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
      }
    });;
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
  }

  recuperarClave() {
    let tokenRestablecimiento = this.servicio.crearTokenRestablecerClave(this.email);
    const templateParams = {
      email: "luisalbertolaramartinez3c@gmail.com",
      urlWeb: "https://kompu.vercel.app",
      urlLogo: "https://kompu.vercel.app/assets/images/icons/kompu.png",
      urlLink: "https://kompu.vercel.app/tokenR?=" + tokenRestablecimiento
    };
    // emailjs.send(
    //   'servicio_correo_kompu',
    //   'plantilla_resetear_clave',
    //   templateParams,
    //   'UXLui2Yw1nIYtD-OL'
    // ).then(() => {
    //   this.estadoRestablecerClave = "Correo enviado exitosamente";
    // }).catch(() => {
    //   this.estadoRestablecerClave = "Error al enviar el correo";
    // });
  }
}
