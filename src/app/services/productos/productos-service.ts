import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../../models/producto';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private urlApi = "assets/data/productos.json";

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.urlApi).pipe(
      map(productos => {
        return productos.map(producto => {
          return { ...producto, fechaLanzamiento: new Date(producto.fechaLanzamiento) };
        });
      })
    );
  }
}
