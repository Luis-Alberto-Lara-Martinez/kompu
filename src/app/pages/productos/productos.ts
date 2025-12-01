import { Component } from '@angular/core';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductosService } from '../../services/productos/productos-service';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-productos',
  imports: [Menu, PiePagina, ScrollToTop, FormsModule, RouterLink],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  marcas: string[] = [];
  precioMaximoProductos: number = 0;
  mostrarFiltros: boolean = false;
  ordenSeleccionado: string = '';

  filtros = {
    categoria: '',
    marca: '',
    precioMin: 0,
    precioMax: 0
  };

  constructor(private router: Router, private productosService: ProductosService) { }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const cache = localStorage.getItem('listaProductos');
    if (cache) {
      this.productos = JSON.parse(cache);
      this.inicializarFiltros();
    } else {
      this.productosService.obtenerProductos().subscribe({
        next: (lista) => {
          this.productos = lista;
          localStorage.setItem('listaProductos', JSON.stringify(this.productos));
          this.inicializarFiltros();
        },
        error: (err) => console.error('Error cargando productos:', err)
      });
    }
  }

  private inicializarFiltros(): void {
    this.categorias = [...new Set(this.productos.map(p => p.categoria))].sort();
    this.marcas = [...new Set(this.productos.map(p => p.marca))].sort();

    // Calcular precio máximo de todos los productos
    this.precioMaximoProductos = Math.ceil(Math.max(...this.productos.map(p => p.precio)));
    this.filtros.precioMax = this.precioMaximoProductos;

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const cumpleCategoria = !this.filtros.categoria || p.categoria === this.filtros.categoria;
      const cumpleMarca = !this.filtros.marca || p.marca === this.filtros.marca;
      const cumplePrecio = p.precio >= this.filtros.precioMin && p.precio <= this.filtros.precioMax;
      return cumpleCategoria && cumpleMarca && cumplePrecio;
    });

    this.ordenarProductos();
  }

  seleccionarCategoria(categoria: string): void {
    this.filtros.categoria = this.filtros.categoria === categoria ? '' : categoria;
    this.aplicarFiltros();
  }

  seleccionarMarca(marca: string): void {
    this.filtros.marca = this.filtros.marca === marca ? '' : marca;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {
      categoria: '',
      marca: '',
      precioMin: 0,
      precioMax: this.precioMaximoProductos
    };
    this.aplicarFiltros();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  ordenarProductos(): void {
    switch (this.ordenSeleccionado) {
      case 'precio-desc':
        this.productosFiltrados.sort((a, b) => b.precio - a.precio);
        break;
      case 'precio-asc':
        this.productosFiltrados.sort((a, b) => a.precio - b.precio);
        break;
      case 'nombre-asc':
        this.productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      default:
        // Sin ordenación específica
        break;
    }
  }

  anadirFavorito(producto: Producto): void {

    // 1. Obtener el token del usuario logueado
    const token = localStorage.getItem("token");
    if (!token) {
      alert('Debe iniciar sesión para añadir favoritos.');
      return;
    }

    // 2. Extraer el id del usuario desde el token
    const payload = JSON.parse(atob(token.split(".")[1]));

    // 3. Cargar la lista de usuarios
    const listaUsuarios: Usuario[] = JSON.parse(localStorage.getItem("listaUsuarios") || '[]');

    // 4. Buscar el usuario actual
    const usuario = listaUsuarios.find(u => u.id == payload.id);
    if (!usuario) {
      alert('Usuario no encontrado.');
      return;
    }

    // 5. Verificar si ya está en favoritos
    if (usuario.listaDeseos.includes(producto.id)) {
      alert('Este producto ya está en tus favoritos.');
      return;
    }

    // 6. Añadir el producto
    usuario.listaDeseos.push(producto.id);

    // 7. Guardar cambios
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    alert('Añadido a favoritos.');
  }

  anadirCarrito(producto: Producto): void {
    const token = localStorage.getItem("token");
    if (!token) {
      alert('Debe iniciar sesión para añadir al carrito.');
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const listaUsuarios: Usuario[] = JSON.parse(localStorage.getItem("listaUsuarios") || '[]');
    const usuario = listaUsuarios.find(u => u.id == payload.id);

    if (!usuario) {
      alert('Usuario no encontrado.');
      return;
    }

    if (usuario.carrito[producto.id]) {
      alert("El producto ya está en el carrito.");
      return
    }
    
    usuario.carrito[producto.id] // Añadir con cantidad 1
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    alert('Producto añadido al carrito.');

  }
}