import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loginForm = this.fb.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected hidePassword = true;
  protected isSubmitting = false;
  protected authError = '';
  protected isAuthReady = false;

  ngOnInit(): void {
    this.authService.sessionState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sessionState) => {
        this.isAuthReady = sessionState.isReady;
      });
  }

  protected submit(): void {
    if (this.isSubmitting || !this.isAuthReady) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authError = '';
    this.authService.badCredentials.next(false);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.getPostLoginUrl(), { replaceUrl: true });
        },
        error: (error: HttpErrorResponse) => {
          this.authError = this.getErrorMessage(error);
        },
      });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  protected hasError(controlName: 'identifier' | 'password', errorCode: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.touched && control.hasError(errorCode);
  }

  private getPostLoginUrl(): string {
    const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];

    if (typeof returnUrl !== 'string' || !returnUrl.startsWith('/') || returnUrl === '/login') {
      return '/municipal-data/national';
    }

    return returnUrl;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const backendMessage =
      error?.error?.message ||
      error?.error?.error ||
      error?.error?.msg;

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    if (error.status === 0) {
      return 'We could not reach the server. Please try again.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Incorrect identifier or password.';
    }

    return 'We could not sign you in right now. Please try again.';
  }
}
