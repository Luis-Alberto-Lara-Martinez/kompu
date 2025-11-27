import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-pie-pagina',
  templateUrl: './pie-pagina.html',
  styleUrls: ['./pie-pagina.css'],
})
export class PiePagina {
  year: number = new Date().getFullYear();

  onAppleHover(imagenApple: HTMLImageElement): void {
    imagenApple.src = 'assets/images/icons/apple-store-negro.png';
  }

  onAppleLeave(imagenApple: HTMLImageElement): void {
    imagenApple.src = 'assets/images/icons/apple-store-blanco.png';
  }
}
