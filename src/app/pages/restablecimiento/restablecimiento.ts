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
    console.log('Token recibido:', token);
    if (!token) {
      console.log('No hay token, redirigiendo...');
      // this.router.navigate(['/login']);
      return;
    }
    let payload;
    try {
      let payloadPart = token.split(".")[1];
      console.log('Payload part:', payloadPart);
      // Manejar tanto Base64URL (sin padding) como Base64 estándar (con padding)
      let base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      // Solo agregar padding si no tiene
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }
      console.log('Base64 con padding:', base64);
      payload = JSON.parse(atob(base64));
      console.log('Payload decodificado:', payload);
      if (!payload || !payload.exp) {
        console.log('Payload inválido o sin exp');
        // this.router.navigate(['/login']);
        return;
      }
      const ahora = Math.floor(Date.now() / 1000);
      console.log('Tiempo actual:', ahora);
      console.log('Token expira:', payload.exp);
      console.log('Diferencia (segundos):', payload.exp - ahora);
      if (payload.exp < ahora) {
        console.log('Token expirado, redirigiendo...');
        // this.router.navigate(['/login']);
        return;
      }
      console.log('Token válido, email:', payload.email);
    } catch (e) {
      console.error('Error al decodificar token:', e);
      // this.router.navigate(['/login']);
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
