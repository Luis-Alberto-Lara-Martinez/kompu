import { Component, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos/productos-service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, Menu, PiePagina, ScrollToTop],
  templateUrl: './detalles-producto.html',
  styleUrl: './detalles-producto.css',
})
export class DetallesProducto {
  producto?: Producto;
  imagenActivaIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;
    const id = Number(idParam);

    if (isPlatformBrowser(this.platformId)) {
      const cache = localStorage.getItem('listaProductos');
      if (cache) {
        const lista: Producto[] = JSON.parse(cache);
        this.producto = lista.find(p => p.id === id);
        return;
      }
    }

    this.productosService.obtenerProductos().subscribe({
      next: (lista) => {
        this.producto = lista.find(p => p.id === id);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('listaProductos', JSON.stringify(lista));
        }
      },
      error: (err) => console.error('Error cargando producto:', err)
    });
  }

  añadirFavorito(producto: Producto) {
    if (!isPlatformBrowser(this.platformId)) return;
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    if (!usuarioActual.id) {
      alert('Debes iniciar sesión para añadir favoritos');
      return;
    }
    const key = `favoritos_${usuarioActual.id}`;
    const favoritos: Producto[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (favoritos.some(p => p.id === producto.id)) {
      alert('Este producto ya está en tus favoritos');
      return;
    }
    favoritos.push(producto);
    localStorage.setItem(key, JSON.stringify(favoritos));
    alert('Producto añadido a favoritos');
  }
}
