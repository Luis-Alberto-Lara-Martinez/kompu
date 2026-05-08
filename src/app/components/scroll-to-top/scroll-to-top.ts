import {Component, HostListener} from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [],
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.css',
})
export class ScrollToTop {
  esVisible = false;

  @HostListener('window:scroll', [])
  manejoScroll() {
    this.esVisible = window.scrollY > 10;
  }

  scrollToTop() {
    window.scrollTo({top: 0, behavior: "smooth"});
  }
}
