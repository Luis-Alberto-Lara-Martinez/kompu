import { Component } from '@angular/core';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos/productos-service';
@Component({
  selector: 'app-home',
  imports: [Menu, PiePagina, ScrollToTop],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  ultimosProductos: Producto[] = [];
  productos: Producto[] = [];

  constructor(private servicio: ProductosService) { }

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
}