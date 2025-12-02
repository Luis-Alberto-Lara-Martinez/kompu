import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  nuevaClave: string = "";
  confirmarNuevaClave: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    let token = this.route.snapshot.queryParams['tokenR'];
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload || !payload.exp) {
        this.router.navigate(['/login']);
        return;
      }
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        this.router.navigate(['/login']);
        return;
      }
    } catch (e) {
      this.router.navigate(['/login']);
      return;
    }
    this.email = payload.email;
  }

  crearNuevaClave() {
    this.error = "";
    if (!this.nuevaClave || !this.confirmarNuevaClave) {
      this.error = "Por favor, completa ambos campos";
      return;
    }
    if (this.nuevaClave !== this.confirmarNuevaClave) {
      this.error = "Las contraseñas no coinciden";
      return;
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!regex.test(this.nuevaClave)) {
      this.error = "La contraseña debe tener al menos 6 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales";
      return;
    }
    this.cargando = true;
    setTimeout(() => {
      let listaUsuariosString = localStorage.getItem("listaUsuarios");
      if (listaUsuariosString) {
        let listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
        let usuario = listaUsuarios.find(u =>
          u.email.toLowerCase() == this.email.toLowerCase()
        );
        if (usuario) {
          usuario.clave = btoa(this.nuevaClave);
          localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
        }
      }
      this.cargando = false;
      this.router.navigate(['/login']);
    }, 2000);
  }
}
