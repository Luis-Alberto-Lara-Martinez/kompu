import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Menu} from "../../components/menu/menu";
import {PiePagina} from "../../components/pie-pagina/pie-pagina";
import {ScrollToTop} from "../../components/scroll-to-top/scroll-to-top";
import {CommonModule} from '@angular/common';
import {UsuariosService} from '../../services/usuarios/usuarios-service';
import {Usuario} from '../../models/usuario';

@Component({
  selector: 'app-datos-personales',
  imports: [Menu, PiePagina, ScrollToTop, CommonModule],
  templateUrl: './datos-personales.html',
  styleUrl: './datos-personales.css',
})
export class DatosPersonales {
  usuario: Usuario | null = null;
  id: number = 0;
  nombre: string = "";
  email: string = "";
  clave: string = "";
  telefono: string = "";
  direccion: string = "";

  constructor(private router: Router, private usuariosService: UsuariosService) {
  }

  ngOnInit() {
    if (typeof window != "undefined") {
      this.obtenerDatosUsuario();
    }
  }

  obtenerDatosUsuario(): void {
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;
    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;
    const listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) return;
    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const usuario = listaUsuarios.find(u => u.id == payload.id)
    if (!usuario) return;

    this.nombre = usuario.nombre;
    this.email = usuario.email;
    this.clave = usuario.clave;
    this.telefono = usuario.telefono;
    this.direccion = usuario.direccion;
  }
}
