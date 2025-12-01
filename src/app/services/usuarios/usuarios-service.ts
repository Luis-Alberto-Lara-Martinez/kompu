import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private claveSecreta = "luissamuelalejandrokompu";
  private urlApi = "assets/data/usuarios.json";

  constructor(private http: HttpClient) { }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlApi).pipe(
      map(usuarios => {
        return usuarios.map(usuario => {
          return { ...usuario, clave: btoa(usuario.clave) };
        });
      })
    );
  }

  iniciarSesion(email: string, clave: string): Observable<string> {
    const listaUsuariosRaw = localStorage.getItem("listaUsuarios");
    if (!listaUsuariosRaw) {
      return throwError(() => new HttpErrorResponse({ status: 403 }));
    }

    const listaUsuarios: Usuario[] = JSON.parse(listaUsuariosRaw);

    const usuario = listaUsuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.clave === btoa(clave));

    if (!usuario) {
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    }

    let header = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    }));

    let payload = btoa(JSON.stringify({
      id: usuario.id,
      userName: usuario.nombre,
      rol: usuario.rol,
      exp: Math.floor(Date.now() / 1000) + (5 * 3600)
    }));

    let firma = btoa(this.claveSecreta);

    return of(`${header}.${payload}.${firma}`);
  }
}
