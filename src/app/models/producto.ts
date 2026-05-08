export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoria: string;
  precio: number;
  stock: number;
  listaImagenes: string[];
  descripcion: string;
  valoraciones: Valoracion[];
  fechaLanzamiento: Date;
}

export interface Valoracion {
  idUsuario: number;
  nota: number;
  comentario: string | null;
}
