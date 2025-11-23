import { Component } from '@angular/core';
import { Menu } from "../../components/menu/menu";
import { PiePagina } from "../../components/pie-pagina/pie-pagina";

@Component({
  selector: 'app-home',
  imports: [Menu, PiePagina],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
