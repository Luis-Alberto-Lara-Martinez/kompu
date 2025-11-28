import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class Usuarios {
  private URL_API = "assets/data/usuarios.json";

  constructor(private http: HttpClient) { }

  obtenerUsuarios() {
    return this.http.get<Usuario[]>(this.URL_API);
  }
}
