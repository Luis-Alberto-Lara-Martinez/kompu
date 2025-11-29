import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../services/usuarios/usuarios';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  cargando: boolean = false;
  error: string = '';

  email: string = '';
  clave: string = '';

  constructor(private servicio: Usuarios, private router: Router) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.servicio.obtenerUsuarios().subscribe({
      next: listaUsuarios => {
        if (typeof window !== 'undefined') {
          localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
        }
      }
    });
  }

  onLogin() {
    this.cargando = true;
    setTimeout(() => {
      this.error = '';
    }, 1);
    this.servicio.iniciarSesion(this.email, this.clave).subscribe({
      next: token => {
        this.cargando = false;
        localStorage.setItem("token", token);
        this.router.navigate(['/home']);
      },
      error: err => {
        if (err.status === 403) {
          this.cargando = false;
          this.error = "Error: lista de usuarios no existente. Se recargará la lista y vuelva a intentarlo.";
          this.cargarUsuarios();
          return;
        }

        if (err.status === 401) {
          this.cargando = false;
          this.error = "Email y/o clave incorrectos";
          return;
        }
      }
    });
  }
}