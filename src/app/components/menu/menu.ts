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
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
        localStorage.removeItem("token");
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      this.router.navigate(['/login']);
      return;
    }
    this.esAdministrador = payload.rol === "administrador";
    this.userName = payload.userName;
  }

  cerrarSesion() {
    let token = localStorage.getItem("token");
    if (token) localStorage.removeItem("token");
    this.router.navigate(['/login']);
  }
}