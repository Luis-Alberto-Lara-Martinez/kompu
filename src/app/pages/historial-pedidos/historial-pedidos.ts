import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Menu} from "../../components/menu/menu";
import {PiePagina} from "../../components/pie-pagina/pie-pagina";
import {ScrollToTop} from "../../components/scroll-to-top/scroll-to-top";
import {Router} from '@angular/router';
import {Pedido} from '../../models/pedido';
import {Producto} from '../../models/producto';

@Component({
  selector: 'app-historial-pedidos',
  imports: [Menu, PiePagina, ScrollToTop, CommonModule],
  templateUrl: './historial-pedidos.html',
  styleUrl: './historial-pedidos.css',
})
export class HistorialPedidos implements OnInit {
  pedidos: any[] = [];
  listaProductos: Producto[] = [];

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    // Obtener el usuario actual
    const tokenString = localStorage.getItem("token");
    if (!tokenString) return;
    const payload = JSON.parse(atob(tokenString.split(".")[1]));
    if (!payload) return;

    // Cargar los productos
    const listaProductosString = localStorage.getItem("listaProductos");
    if (listaProductosString) {
      this.listaProductos = JSON.parse(listaProductosString);
    }

    // Cargar los pedidos del usuario
    const listaPedidosString = localStorage.getItem("listaPedidos");
    if (!listaPedidosString) return;

    const listaPedidos: Pedido[] = JSON.parse(listaPedidosString);

    // Filtrar los pedidos del usuario actual y añadir información de productos
    this.pedidos = listaPedidos
      .filter(pedido => pedido.idUsuario === payload.id)
      .map(pedido => {
        const productosConInfo = pedido.listaProductos.map(item => {
          const producto = this.listaProductos.find(p => p.id === item.idProducto);
          return {
            ...item,
            nombre: producto?.nombre || 'Producto desconocido',
            imagen: producto?.listaImagenes?.[0] || ''
          };
        });

        return {
          ...pedido,
          productosConInfo
        };
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Más recientes primero
  }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.listaProductos.find(p => p.id === idProducto);
    return producto?.nombre || 'Producto desconocido';
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'entregado':
        return 'estado-entregado';
      case 'enviado':
        return 'estado-enviado';
      case 'pendiente':
        return 'estado-pendiente';
      default:
        return 'estado-pendiente';
    }
  }
}
