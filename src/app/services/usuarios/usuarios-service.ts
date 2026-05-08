import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Usuario} from '../../models/usuario';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private claveSecreta = "luissamuelalejandrokompu";
  private urlApi = "assets/data/usuarios.json";

  constructor(private http: HttpClient) {
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.urlApi).pipe(
      map(usuarios => {
        return usuarios.map(usuario => {
          return {...usuario, clave: btoa(usuario.clave)};
        });
      })
    );
  }

  base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  crearTokenRestablecerClave(email: string): string {
    let header = this.base64UrlEncode(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    }));

    let payload = this.base64UrlEncode(JSON.stringify({
      email: email,
      exp: Math.floor(Date.now() / 1000) + (5 * 3600)
    }));

    let firma = this.base64UrlEncode(this.claveSecreta);
    return `${header}.${payload}.${firma}`;
  }

  crearToken(usuario: Usuario): string {
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

    return `${header}.${payload}.${firma}`;
  }
}
