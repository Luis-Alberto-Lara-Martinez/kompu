import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-gestion-productos',
  imports: [Menu, PiePagina, ScrollToTop, CommonModule, FormsModule],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css',
})
export class GestionProductos {
  productos: Producto[] = [];
  editandoId: number | null = null;
  nuevoProducto: Partial<Producto> = {
    nombre: '',
    marca: '',
    categoria: '',
    precio: 0,
    stock: 0,
    listaImagenes: [],
    descripcion: '',
    valoraciones: [],
    fechaLanzamiento: new Date()
  };
  // Campo auxiliar para 1 URL de imagen en el formulario
  listaImagenUrl: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const tokenString = localStorage.getItem('token');
    if (!tokenString) { this.router.navigate(['/home']); return; }
    const payload = JSON.parse(atob(tokenString.split('.')?.[1] || ''));
    if (!payload || payload.rol !== 'administrador') { this.router.navigate(['/home']); return; }
    const listaString = localStorage.getItem('listaProductos');
    if (listaString) {
      this.productos = JSON.parse(listaString);
    }
  }

  guardarProductos(): void {
    localStorage.setItem('listaProductos', JSON.stringify(this.productos));
  }

  iniciarEdicion(p: Producto): void {
    this.editandoId = p.id;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
  }

  guardarEdicion(p: Producto): void {
    // Validaciones básicas
    p.precio = Number(p.precio) || 0;
    p.stock = Number(p.stock) || 0;
    this.guardarProductos();
    this.editandoId = null;
  }

  eliminarProducto(p: Producto): void {
    this.productos = this.productos.filter(x => x.id !== p.id);
    this.guardarProductos();
  }

  agregarProducto(): void {
    // Asignar ID nuevo
    const nuevoId = this.productos.length ? Math.max(...this.productos.map(p => p.id)) + 1 : 1;
    const producto: Producto = {
      id: nuevoId,
      nombre: this.nuevoProducto.nombre || 'Nuevo producto',
      marca: this.nuevoProducto.marca || 'Sin marca',
      categoria: this.nuevoProducto.categoria || 'general',
      precio: Number(this.nuevoProducto.precio) || 0,
      stock: Number(this.nuevoProducto.stock) || 0,
      listaImagenes: this.listaImagenUrl ? [this.listaImagenUrl] : [],
      descripcion: this.nuevoProducto.descripcion || '',
      valoraciones: [],
      fechaLanzamiento: new Date()
    };
    this.productos.push(producto);
    this.guardarProductos();
    // Reset formulario
    this.nuevoProducto = {
      nombre: '', marca: '', categoria: '', precio: 0, stock: 0, listaImagenes: [], descripcion: ''
    };
    this.listaImagenUrl = '';
  }
}
