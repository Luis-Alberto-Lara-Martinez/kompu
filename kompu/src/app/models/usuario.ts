export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    clave: string;
    telefono: string;
    direccion: string;
    rol: string;
    estado: string;
    carrito: Carrito[];
    listaDeseos: number[];
}

export interface Carrito {
    idProducto: number;
    cantidad: number;
}