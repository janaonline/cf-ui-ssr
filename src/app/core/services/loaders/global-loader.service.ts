import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalLoaderService {

  loading = signal(false);

  constructor() { }

  showLoader() {
    this.loading.set(true);
  }

  hideLoader() {
    this.loading.set(false);
  }
}
