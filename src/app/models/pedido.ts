export interface Pedido {
    id: number;
    idUsuario: number;
    fecha: Date;
    listaProductos: ProductosCarrito[];
    precioTotal: number;
    estado: string;
    numFactura: number;
    subprecio: number;
    iva: number;
}

export interface ProductosCarrito {
    idProducto: number;
    cantidad: number;
    precio: number;
}