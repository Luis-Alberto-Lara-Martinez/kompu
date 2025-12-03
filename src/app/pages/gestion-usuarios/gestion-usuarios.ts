import { Component } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [Menu, PiePagina, ScrollToTop, CommonModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios {
  usuarios: Usuario[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const tokenString = localStorage.getItem('token');
    if (!tokenString) { this.router.navigate(['/home']); return; }

    let payload;
    try {
      payload = JSON.parse(atob(tokenString.split('.')?.[1] || ''));
    } catch (e) {
      this.router.navigate(['/home']);
      return;
    }

    if (!payload || payload.rol !== 'administrador') { this.router.navigate(['/home']); return; }
    const listaUsuariosString = localStorage.getItem('listaUsuarios');
    if (!listaUsuariosString) return;
    this.usuarios = JSON.parse(listaUsuariosString);
  }

  toggleEstado(usuario: Usuario): void {
    if (typeof window === 'undefined') return;
    const listaUsuariosString = localStorage.getItem('listaUsuarios');
    if (!listaUsuariosString) return;
    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const idx = listaUsuarios.findIndex(u => u.id === usuario.id);
    if (idx === -1) return;
    listaUsuarios[idx].estado = listaUsuarios[idx].estado === 'activado' ? 'desactivado' : 'activado';
    localStorage.setItem('listaUsuarios', JSON.stringify(listaUsuarios));
    this.usuarios = listaUsuarios;
  }
}
