import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {Menu} from "../../components/menu/menu";
import {PiePagina} from "../../components/pie-pagina/pie-pagina";
import {ScrollToTop} from "../../components/scroll-to-top/scroll-to-top";
import {Producto} from '../../models/producto';
import {ProductosService} from '../../services/productos/productos-service';
import {Usuario} from '../../models/usuario';

@Component({
  selector: 'app-detalles-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, Menu, PiePagina, ScrollToTop, FormsModule],
  templateUrl: './detalles-producto.html',
  styleUrl: './detalles-producto.css',
})
export class DetallesProducto {
  producto?: Producto;
  imagenActivaIndex = 0;
  mensajeEmergente: string = '';
  usuarios: Usuario[] = [];

  // Formulario de reseña
  mostrarFormularioResena: boolean = false;
  nuevaResena = {
    nota: 5,
    comentario: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;
    const id = Number(idParam);

    if (isPlatformBrowser(this.platformId)) {
      const cache = localStorage.getItem('listaProductos');
      if (cache) {
        const lista: Producto[] = JSON.parse(cache);
        this.producto = lista.find(p => p.id === id);
      } else {
        this.cargarProducto(id);
      }

      // Cargar usuarios para mostrar nombres en reseñas
      const usuariosCache = localStorage.getItem('listaUsuarios');
      if (usuariosCache) {
        this.usuarios = JSON.parse(usuariosCache);
      }
      return;
    }

    this.cargarProducto(id);
  }

  private cargarProducto(id: number): void {
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

  anadirFavorito(producto: Producto): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const listaUsuarios: Usuario[] = JSON.parse(localStorage.getItem("listaUsuarios") || '[]');
    const usuario = listaUsuarios.find(u => u.id == payload.id);

    if (!usuario) {
      this.mostrarMensaje('Usuario no encontrado.');
      return;
    }

    if (usuario.listaDeseos.includes(producto.id)) {
      this.mostrarMensaje('Este producto ya está en tus favoritos.');
      return;
    }

    usuario.listaDeseos.push(producto.id);
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    this.mostrarMensaje('Añadido a favoritos.');
  }

  anadirCarrito(producto: Producto): void {
    if (!isPlatformBrowser(this.platformId)) return;

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

    const productoEnCarrito = listaUsuarios[usuarioIndex].carrito
      .find((item: any) => item.idProducto === producto.id);

    if (productoEnCarrito) {
      productoEnCarrito.cantidad += 1;
      this.mostrarMensaje('Cantidad aumentada en el carrito.');
    } else {
      const nuevoProductoCarrito = {
        idProducto: producto.id,
        cantidad: 1
      };
      listaUsuarios[usuarioIndex].carrito.push(nuevoProductoCarrito);
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

  obtenerNombreUsuario(idUsuario: number): string {
    const usuario = this.usuarios.find(u => u.id === idUsuario);
    return usuario ? usuario.nombre : 'Usuario desconocido';
  }

  generarEstrellas(nota: number): string[] {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= nota ? '★' : '☆');
    }
    return estrellas;
  }

  calcularPromedioValoraciones(): number {
    if (!this.producto || !this.producto.valoraciones || this.producto.valoraciones.length === 0) {
      return 0;
    }
    const suma = this.producto.valoraciones.reduce((acc, val) => acc + val.nota, 0);
    return Number((suma / this.producto.valoraciones.length).toFixed(1));
  }

  toggleFormularioResena(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.mostrarFormularioResena = !this.mostrarFormularioResena;
    if (!this.mostrarFormularioResena) {
      // Resetear formulario al cerrar
      this.nuevaResena = {nota: 5, comentario: ''};
    }
  }

  enviarResena(): void {
    if (!isPlatformBrowser(this.platformId) || !this.producto) return;

    const token = localStorage.getItem("token");
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const idUsuario = payload.id;

    // Verificar si el usuario ya ha valorado este producto
    if (this.producto.valoraciones.some(v => v.idUsuario === idUsuario)) {
      this.mostrarMensaje('Ya has valorado este producto.');
      return;
    }

    // Crear la nueva valoración
    const nuevaValoracion = {
      idUsuario: idUsuario,
      nota: this.nuevaResena.nota,
      comentario: this.nuevaResena.comentario.trim() || null
    };

    // Añadir la valoración al producto
    this.producto.valoraciones.push(nuevaValoracion);

    // Actualizar localStorage
    const listaProductos: Producto[] = JSON.parse(localStorage.getItem('listaProductos') || '[]');
    const productoIndex = listaProductos.findIndex(p => p.id === this.producto!.id);
    if (productoIndex !== -1) {
      listaProductos[productoIndex].valoraciones.push(nuevaValoracion);
      localStorage.setItem('listaProductos', JSON.stringify(listaProductos));
    }

    // Resetear y cerrar formulario
    this.nuevaResena = {nota: 5, comentario: ''};
    this.mostrarFormularioResena = false;
    this.mostrarMensaje('¡Gracias por tu reseña!');
  }

  cancelarResena(): void {
    this.mostrarFormularioResena = false;
    this.nuevaResena = {nota: 5, comentario: ''};
  }
}
