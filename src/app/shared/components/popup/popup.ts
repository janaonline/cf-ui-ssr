import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SafeHtml } from '@angular/platform-browser';

export interface PopupData {
  title?: string;
  message?: string;
  htmlContent?: SafeHtml | string;
  closeButtonText?: string;
}

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  constructor(
    private readonly dialogRef: MatDialogRef<Popup>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}