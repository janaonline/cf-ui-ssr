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
    // console.log('selectedBtnKey', this.buttonIdx(), this.buttons());
    if (this.buttonIdx() > 0 && this.buttonIdx() < this.buttons().length) {
      return this.buttons()[this.buttonIdx()].key;
      
    } else {
      return this.buttons()[0].key;
    }
  });

  constructor() { }

  ngOnInit() {
    this.changeSelectedButton(this.selectedBtnKey());
    // if (this.buttonIdx() > 0 && this.buttonIdx() < this.buttons().length) {
    //   console.log('ngOnInit', this.buttonIdx(), this.buttons());
      
    //   const key = this.buttons()[this.buttonIdx()].key;
    //   this.changeSelectedButton(key);
    // } else {
    //   console.log('ngOnInit default', this.buttons());
    //   this.changeSelectedButton(this.buttons()[0].key);
    // }
  }

  changeSelectedButton(key: string): void {
    // console.log('1st change', key, this.selectedBtnKey());
    // console.log('Changing selected button to:', key);
    this.selectedBtnKey.set(key);
    this.selectedButtonKeyChange.emit(key);
    // if (key !== this.selectedBtnKey()) {
    // }
  }
}
