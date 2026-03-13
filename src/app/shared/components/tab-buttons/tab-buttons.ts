import {
  Component,
  EventEmitter,
  Input,
  input,
  linkedSignal,
  Output,
  output,
  signal
} from '@angular/core';
import { ButtonObj } from '../../../core/models/interfaces';

@Component({
  selector: 'app-tab-buttons',
  imports: [],
  templateUrl: './tab-buttons.html',
  styleUrl: './tab-buttons.scss',
})
export class TabButtons {
  // Input signal to receive the array of buttons from the parent.
  buttons = input.required<ButtonObj[]>();

  // Input signal to receive default button index.
  buttonIdx = input(-1);

  // @Output() selectedButtonKeyChange = new EventEmitter<string>();
  // Output signal to emit the key of the selected button to the parent.
   selectedButtonKeyChange = output<string>();

  // Internal signal to keep track of the currently selected button's key
  selectedBtnKey = linkedSignal<string>(()=>{
    if (this.buttonIdx() > 0 && this.buttonIdx() < this.buttons().length) {
      return this.buttons()[this.buttonIdx()].key;
    } else {
      return this.buttons()[0].key;
    }
  });

  constructor() { }

  ngOnInit() {
    // if (this.buttonIdx() > 0 && this.buttonIdx() < this.buttons().length) {
    //   const key = this.buttons()[this.buttonIdx()].key;
    //   this.changeSelectedButton(key);
    // } else {
    //   this.changeSelectedButton(this.buttons()[0].key);
    // }
  }

  changeSelectedButton(key: string): void {
    console.log('1st change', key);
    if (key !== this.selectedBtnKey()) {
      this.selectedBtnKey.set(key);
      this.selectedButtonKeyChange.emit(key);
    }
  }
}
