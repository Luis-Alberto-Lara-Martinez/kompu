import { Component } from '@angular/core';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";
import { ScrollToTop } from "../../components/scroll-to-top/scroll-to-top";
import { Router } from '@angular/router';

@Component({
  selector: 'app-productos',
  imports: [Menu, PiePagina, ScrollToTop],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  constructor(private router: Router){}
}
