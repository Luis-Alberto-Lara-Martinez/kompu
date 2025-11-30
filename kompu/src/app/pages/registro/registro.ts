import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuarios } from '../../services/usuarios/usuarios';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  // Estados del componente
  cargando: boolean = false;
  error: string = '';
  mensajeExito: string = '';

  // Campos del formulario de registro
  nombre: string = '';
  email: string = '';
  clave: string = '';
  confirmarClave: string = '';
  telefono: string = '';
  direccion: string = '';

  constructor(private servicio: Usuarios, private router: Router) { }

  // Método principal de REGISTRO
  onRegister() {
    console.log('1. INICIANDO REGISTRO...');
    
    // Resetear mensajes
    this.error = '';
    this.mensajeExito = '';
    this.cargando = true;

    // Validaciones
    if (!this.validarCampos()) {
      console.log('VALIDACIONES FALLARON');
      this.cargando = false;
      return;
    }

    console.log('VALIDACIONES PASARON');

    // Preparar datos del usuario
    const usuarioData = {
      nombre: this.nombre.trim(),
      email: this.email.toLowerCase().trim(),
      clave: this.clave,
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim()
    };

    console.log('DATOS A ENVIAR:', usuarioData);

    try {
      const response = this.registrarUsuario(usuarioData);
      console.log('RESPUESTA DEL REGISTRO:', response);
      this.cargando = false;
      this.manejarRegistroExitoso(response);
    } catch (err: any) {
      console.log('ERROR EN REGISTRO:', err);
      this.cargando = false;
      this.manejarErrorRegistro(err);
    }
  }

  // METODO SINCRONO
  private registrarUsuario(usuarioData: any): any {
    console.log('REGISTRO: Iniciando...');
    
    // 1. Obtener lista actual de usuarios del localStorage
    const listaUsuariosRaw = localStorage.getItem("listaUsuarios");
    console.log('localStorage actual:', listaUsuariosRaw);
    
    let listaUsuarios: Usuario[] = [];
    
    if (listaUsuariosRaw) {
      listaUsuarios = JSON.parse(listaUsuariosRaw);
    }

    console.log('Usuarios existentes:', listaUsuarios.length);

    // 2. Verificar si el email ya existe
    const usuarioExistente = listaUsuarios.find(u => 
      u.email.toLowerCase() === usuarioData.email.toLowerCase()
    );

    if (usuarioExistente) {
      console.log('EMAIL YA EXISTE:', usuarioExistente.email);
      throw new HttpErrorResponse({ 
        status: 409, 
        statusText: 'El email ya esta registrado' 
      });
    }

    // 3. Crear nuevo usuario
    const nuevoUsuario: Usuario = {
      id: this.generarNuevoId(listaUsuarios),
      nombre: usuarioData.nombre,
      email: usuarioData.email,
      clave: btoa(usuarioData.clave), // ENCRIPTAR la contraseña
      telefono: usuarioData.telefono || '',
      direccion: usuarioData.direccion || '',
      rol: 'usuario',
      estado: 'activado',
      carrito: [],
      listaDeseos: []
    };

    console.log('NUEVO USUARIO CREADO:', nuevoUsuario);

    // 4. Agregar a la lista
    listaUsuarios.push(nuevoUsuario);
    console.log('LISTA ACTUALIZADA:', listaUsuarios.length, 'usuarios');

    // 5. Guardar en localStorage
    localStorage.setItem("listaUsuarios", JSON.stringify(listaUsuarios));
    
    console.log('GUARDADO EN localStorage exitosamente');

    // 6. Retornar exito
    return { 
      success: true, 
      message: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario 
    };
  }

  // Metodo auxiliar para generar nuevo ID
  private generarNuevoId(usuarios: Usuario[]): number {
  if (usuarios.length === 0) {
    return 1;
  }
  
  // Filtrar solo IDs numéricos válidos
  const idsValidos: number[] = [];
  
  for (let i = 0; i < usuarios.length; i++) {
    const id = usuarios[i].id;
    // Verificar que sea número, no sea NaN y sea mayor que 0
    if (typeof id === 'number' && !isNaN(id) && id > 0) {
      idsValidos.push(id);
    }
  }
  
  if (idsValidos.length === 0) {
    return 1;
  }
  
  const maxId = Math.max.apply(Math, idsValidos);
  const nuevoId = maxId + 1;
  
  console.log('Generando nuevo ID:', nuevoId);
  return nuevoId;
}

  // Metodo para validar campos
  private validarCampos(): boolean {
    // Campos obligatorios
    if (!this.nombre || !this.email || !this.clave || !this.confirmarClave) {
      this.error = 'Nombre, email y contraseñas son obligatorios';
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Por favor, ingrese un email valido';
      return false;
    }

    // Validar contraseñas
    if (this.clave !== this.confirmarClave) {
      this.error = 'Las contraseñas no coinciden';
      return false;
    }

    if (this.clave.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    return true;
  }

  // Manejar registro exitoso
  private manejarRegistroExitoso(response: any) {
    this.mensajeExito = 'Usuario registrado exitosamente!';
    
    // Limpiar formulario
    this.limpiarFormulario();
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  // Manejar errores de registro
  private manejarErrorRegistro(err: any) {
    switch (err.status) {
      case 409:
        this.error = 'Este email ya esta registrado';
        break;
      case 400:
        this.error = 'Datos de registro invalidos';
        break;
      case 422:
        this.error = 'El formato del email no es valido';
        break;
      case 500:
        this.error = 'Error del servidor. Intente mas tarde.';
        break;
      default:
        this.error = 'Error en el registro. Intente nuevamente.';
        break;
    }
  }

  // Limpiar formulario
  private limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.clave = '';
    this.confirmarClave = '';
    this.telefono = '';
    this.direccion = '';
  }
}