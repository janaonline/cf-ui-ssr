import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appRestrictEInput]',
  standalone: true,
})
export class RestrictEInputDirective {
  constructor() {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Prevent typing 'e' or 'E'
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }
}
