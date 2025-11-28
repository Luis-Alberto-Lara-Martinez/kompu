import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  clave = '';

  onLogin() {
    console.log('Usuario:', this.email);
    console.log('Contraseña:', this.clave);
  }
}
