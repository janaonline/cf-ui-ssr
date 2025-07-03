import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-header',
  imports: [Navbar],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  size: string = 'rg';
  textSize = ['sm', 'rg', 'lg'];
  currentTextSize: string = 'rg';
  constructor() { }

  public setFontSize(size: string): void {
    const elem = document.documentElement;

    this.textSize.forEach((item) => elem.classList.remove(item));
    elem.classList.add(size);
    this.currentTextSize = size;
    localStorage.setItem('myLSkey', JSON.stringify({ currentTextSize: size }));
  }

  public scrollToMainContent(): void {
    const element = document.getElementById('main-content');
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}
