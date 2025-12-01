import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { Usuario } from '../../models/usuario';
import { PaypalButton } from "../../components/paypal-button/paypal-button";

@Component({
  selector: 'app-carrito',
  imports: [Menu, PiePagina, ScrollToTop, CommonModule, PaypalButton],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  carrito: Producto[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;
    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;
    const listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) return;
    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const usuario = listaUsuarios.find(u => u.id == payload.id)
    if (!usuario) return;
    const listaProductosString = localStorage.getItem("listaProductos");
    if (!listaProductosString) return;
    const listaProductos: Producto[] = JSON.parse(listaProductosString);
    usuario.carrito.forEach(productoEnCarrito => {
      const producto = listaProductos.find(p => p.id == productoEnCarrito.idProducto)
      if (!producto) return;
      this.carrito.push(producto);
    })
  }

  eliminarDelCarrito(idProducto: number): void {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    // this.favoritos = this.favoritos.filter(p => p.id !== idProducto);
    // localStorage.setItem(`favoritos_${usuarioActual.id}`, JSON.stringify(this.favoritos));
  }
}