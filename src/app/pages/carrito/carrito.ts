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
  carrito: any[] = [];
  precioTotal: number = 0;

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
      producto.stock = productoEnCarrito.cantidad;
      this.carrito.push(producto);
    })
    this.calcularTotal();
  }


  eliminarDelCarrito(idProducto: number): void {
    if (typeof window === 'undefined') return;
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;
    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;
    const listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) return;
    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const usuarioIndex = listaUsuarios.findIndex(u => u.id == payload.id)
    if (usuarioIndex === -1) return;
    const productoIndex = listaUsuarios[usuarioIndex].carrito.findIndex(p => p.idProducto == idProducto);
    if (productoIndex === -1) return;
    listaUsuarios[usuarioIndex].carrito.splice(productoIndex, 1);
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    this.carrito = this.carrito.filter(p => p.id !== idProducto);
    this.calcularTotal();
  }


  transformarPrecio(precio: number): string {
    if (isNaN(precio)) return '0,00€';

    const fijo = precio.toFixed(2); // "1234.56"
    const [enteroStr, decStr] = fijo.split('.');

    // Insertar puntos de miles
    const conMiles = enteroStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${conMiles},${decStr}€`;
  }

  actualizarCantidad(producto: any, event: any): void {
    const nuevaCantidad = parseInt(event.target.value, 10) || 1;

    // Actualizar cantidad en el objeto producto
    producto.cantidad = nuevaCantidad;

    // Actualizar en localStorage
    this.actualizarCantidadEnLocalStorage(producto.id, nuevaCantidad);

    // Recalcular el total
    this.calcularTotal();
  }

  private actualizarCantidadEnLocalStorage(idProducto: number, cantidad: number): void {
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;

    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;

    const listaUsuariosString = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosString) return;

    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosString);
    const usuarioIndex = listaUsuarios.findIndex(u => u.id == payload.id);

    if (usuarioIndex !== -1) {
      const productoIndex = listaUsuarios[usuarioIndex].carrito
        .findIndex((item: any) => item.idProducto === idProducto);

      if (productoIndex !== -1) {
        listaUsuarios[usuarioIndex].carrito[productoIndex].cantidad = cantidad;
        localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
      }
    }
  }

  calcularTotal(): void {
    this.precioTotal = this.carrito.reduce((total, producto) => {
      const precio = Number(producto.precio) || 0;
      const cantidad = Number(producto.cantidad) || 1;
      return total + (precio * cantidad);
    }, 0);
  }
}