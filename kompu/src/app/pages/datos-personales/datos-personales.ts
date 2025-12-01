import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { CommonModule } from '@angular/common';
import { Usuarios } from '../../services/usuarios/usuarios';

interface Usuario {
    nombre: string;
    correo: string;
    clave: string;
    telefono: string;
    direccion: string;
}

@Component({
    selector: 'app-datos-personales',
    imports: [Menu, PiePagina, ScrollToTop, CommonModule],
    templateUrl: './datos-personales.html',
    styleUrl: './datos-personales.css',
})
export class DatosPersonales implements OnInit {
    usuario: Usuario | null = null;

    constructor(private router: Router, private usuariosService: Usuarios) { }

    ngOnInit() {
        if (typeof window != "undefined") {
            this.obtenerDatosUsuario();
        }
    }

    obtenerDatosUsuario(): void {
        try {
            const usuarioGuardado = localStorage.getItem('usuarioActual');

            if (usuarioGuardado) {
                this.usuario = JSON.parse(usuarioGuardado);
                console.log('Datos del usuario:', this.usuario);
            } else {
                console.log('No hay usuario en sesión');
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            this.usuario = null;
        }
    }
}