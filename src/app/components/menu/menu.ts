import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  esAdministrador: boolean = false;
  userName: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    if (typeof window === 'undefined') return;
    let token = localStorage.getItem("token");
    if (!token) return;
    let payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload || Math.floor(Date.now() / 1000) > payload.exp) {
      localStorage.removeItem("token");
      return;
    }

    this.esAdministrador = payload.rol === "administrador";
    this.userName = payload.userName;
  }

  buscador(term: string) {
    if (!term.trim()) {
      this.router.navigate(['/productos']);
    } else {
      this.router.navigate(['/productos'], {
        queryParams: { terminoABuscar: term }
      });
    }
  }

  cerrarSesion() {
    let token = localStorage.getItem("token");
    if (token) localStorage.removeItem("token");

    if (this.router.url === '/home') {
      location.reload()
    } else {
      this.router.navigate(['/home']);
    }
  }
}