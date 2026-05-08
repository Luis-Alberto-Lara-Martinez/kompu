import {Component} from '@angular/core';
import {Menu} from "../../components/menu/menu";
import {PiePagina} from "../../components/pie-pagina/pie-pagina";
import {ScrollToTop} from "../../components/scroll-to-top/scroll-to-top";
import {Producto} from '../../models/producto';
import {ProductosService} from '../../services/productos/productos-service';
import {Router, RouterLink} from '@angular/router';
import {Usuario} from '../../models/usuario';

@Component({
  selector: 'app-home',
  imports: [Menu, PiePagina, ScrollToTop, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  ultimosProductos: Producto[] = [];
  productos: Producto[] = [];
  mensajeEmergente: string = '';

  constructor(private servicio: ProductosService, private router: Router) {
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const listaProductos = localStorage.getItem("listaProductos");

    if (listaProductos) {
      this.productos = JSON.parse(listaProductos).map((p: any) => ({
        ...p,
        fechaLanzamiento: new Date(p.fechaLanzamiento)
      }));
      this.cargarUltimosProductos();
    } else {
      this.servicio.obtenerProductos().subscribe({
        next: (listaProductos) => {
          // Convertir fechas a Date
          this.productos = listaProductos.map((p: any) => ({
            ...p,
            fechaLanzamiento: new Date(p.fechaLanzamiento)
          }));

          localStorage.setItem("listaProductos", JSON.stringify(this.productos));
          this.cargarUltimosProductos();
        },
        error: (err) => console.error("Error cargando productos:", err)
      });
    }
  }

  private cargarUltimosProductos() {
    this.ultimosProductos = [...this.productos]
      .sort((a, b) => b.fechaLanzamiento.getTime() - a.fechaLanzamiento.getTime())
      .slice(0, 5);
  }

  anadirCarrito(producto: Producto): void {
    const token = localStorage.getItem("token");
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const listaUsuarios: Usuario[] = JSON.parse(localStorage.getItem("listaUsuarios") || '[]');
    const usuarioIndex = listaUsuarios.findIndex(u => u.id == payload.id);
    if (usuarioIndex === -1) {
      this.mostrarMensaje('Usuario no encontrado.');
      return;
    }

    const existente = listaUsuarios[usuarioIndex].carrito.find((item: any) => item.idProducto === producto.id);
    if (existente) {
      existente.cantidad += 1;
      this.mostrarMensaje('Cantidad aumentada en el carrito.');
    } else {
      listaUsuarios[usuarioIndex].carrito.push({idProducto: producto.id, cantidad: 1});
      this.mostrarMensaje('Añadido al carrito.');
    }
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
  }

  mostrarMensaje(mensaje: string): void {
    this.mensajeEmergente = mensaje;
    setTimeout(() => {
      this.mensajeEmergente = '';
    }, 2000);
  }
}
