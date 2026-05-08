import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Pedido} from '../../models/pedido';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private urlApi = "assets/data/pedidos.json";

  constructor(private http: HttpClient) {
  }

  obtenerPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.urlApi).pipe(
      map(pedidos => {
        return pedidos.map(pedido => {
          return {...pedido, fecha: new Date(pedido.fecha)};
        });
      })
    );
  }
}
