import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: true,
})
export class DecimalLimitDirective {
  @Input() appDecimalLimit!: number | null;

  constructor(
    private el: ElementRef,
    private _snackBar: MatSnackBar,
  ) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // console.log(event.key);
    if (this.appDecimalLimit == null) return;
    if (this.appDecimalLimit == 0 && event.key == '.') {
      // swal.fire('Warning', 'Deciamls are not allow', 'warning');
      this.triggerSnackbar('Please enter a whole number');
      return event.preventDefault();
    }
    const inputValue = this.el.nativeElement.value;
    const eventValue = parseInt(event.key);
    if (isNaN(eventValue)) {
      return;
    }

    const decimal = inputValue.split('.')?.[1];

    // console.log(decimal?.length, this.appDecimalLimit);
    if (decimal?.length >= this.appDecimalLimit) {
      // swal.fire('Warning', `Upto ${this.appDecimalLimit} are allowed`, 'warning');
      this.triggerSnackbar(`Decimals are allowed up to ${this.appDecimalLimit} places only`);
      event.preventDefault();
    }
  }
  triggerSnackbar(msg: string) {
    this._snackBar.open(msg, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
      // panelClass: ['snackbar-success']
      panelClass: ['custom-snackbar-success'],
    });
  }
}
