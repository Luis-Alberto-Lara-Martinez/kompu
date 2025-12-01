import { Component } from '@angular/core';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router } from '@angular/router';
import { PaypalButton } from "../../components/paypal-button/paypal-button";

@Component({
  selector: 'app-carrito',
  imports: [Menu, PiePagina, ScrollToTop, PaypalButton],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  constructor(private router: Router){}
  

}
