import {
  Component,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ButtonObj } from '../../../core/models/interfaces';

@Component({
  selector: 'app-tab-buttons',
  imports: [],
  templateUrl: './tab-buttons.html',
  styleUrl: './tab-buttons.scss',
})
export class TabButtons implements OnInit, OnChanges {
  // Input signal to receive the array of buttons from the parent.
  buttons = input.required<ButtonObj[]>();

  // Output signal to emit the key of the selected button to the parent.
  selectedButtonKeyChange = output<string>();

  // Internal signal to keep track of the currently selected button's key
  selectedBtnKey = signal<string>('');

  constructor() { }

  ngOnInit() {
    this.setDefaultSelectedButton();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['buttons'] && !changes['buttons'].firstChange) {
      this.setDefaultSelectedButton();
    }
  }

  private setDefaultSelectedButton(): void {
    if (this.buttons()?.length === 0) return;

    const defaultKey = this.buttons()[0].key;

    if (this.selectedBtnKey() !== defaultKey) {
      this.selectedBtnKey.set(defaultKey);
      this.selectedButtonKeyChange.emit(defaultKey);
    }
  }

  buttonClick(key: string): void {
    this.selectedBtnKey.set(key);
    this.selectedButtonKeyChange.emit(key);
  }
}
