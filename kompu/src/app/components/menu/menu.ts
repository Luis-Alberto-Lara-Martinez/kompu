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

    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload) return;

    if (this.isExpired(payload.exp)) {
      alert("Error: token expirado");
      return;
    }

    this.esAdministrador = payload.rol === "administrador";
    this.userName = payload.userName;
  }

  private decodeToken(token: string): any | null {
    try {
      const base64 = token.split('.')[1];
      return JSON.parse(atob(base64));
    } catch {
      console.error("Token inválido");
      return null;
    }
  }

  private isExpired(exp: number): boolean {
    return Math.floor(Date.now() / 1000) > exp;
  }

  onSearch(term: string) {
    if (!term.trim()) return;
    this.router.navigate(['/productos'], {
      queryParams: { buscar: term }
    });
  }

  cerrarSesion() { }
}
