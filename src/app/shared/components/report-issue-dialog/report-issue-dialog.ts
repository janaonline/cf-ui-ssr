import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { S3FileURLResponse } from '../../../core/models/s3Responses/fileURLResponse';
import { FileService } from '../../../core/services/file.service';
import { GlobalLoaderService } from '../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../core/services/utility-service';
import { ReportIssueService, ResponseData } from './report-isssue.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-report-issue-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
  templateUrl: './report-issue-dialog.html',
  styleUrl: './report-issue-dialog.scss',
})
export class ReportIssueDialog implements OnInit {
  readonly MAX_LEN_DESC = 500;
  readonly MIN_LEN_DESC = 25;
  readonly FILE_SIZE_LIMIT = 2e6; // 2 MB in bytes
  readonly reportIssueForm: FormGroup = new FormGroup({
    issueKind: new FormControl('', [Validators.required]),
    desc: new FormControl('', [
      Validators.required,
      Validators.maxLength(this.MAX_LEN_DESC),
      Validators.minLength(this.MIN_LEN_DESC),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\S+@\S+\.\S+$/),
    ]),
    issueScreenshotUrl: new FormControl('', []),
  });
  file?: File;
  apiResMsg = signal('');

  constructor(
    public dialogRef: MatDialogRef<ReportIssueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { pageContext: string },

    private fileService: FileService,
    private reportIssueService: ReportIssueService,
    private utilityService: UtilityService,
    private globalLoader: GlobalLoaderService,
    private router: Router
  ) {}

  ngOnInit() {}

  private getControl(controlName: string) {
    return this.reportIssueForm.get(controlName);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.getControl(controlName);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) {
      return 'This field is required';
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
    }

    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['sizeLimit']) {
      // Convert bytes to MB
      return `File size cannot be more than ${this.FILE_SIZE_LIMIT / 1e6} MB`;
    }

    if (control.errors['email']) {
      return 'Enter a valid email address';
    }

    if (control.errors['pattern']) {
      return 'Invalid value';
    }

    return null;
  }

  trimText(event: Event, controlName: string): void {
    const control = this.reportIssueForm.get(controlName);
    if (!control) return;

    const el = event.target as HTMLInputElement | HTMLTextAreaElement;
    const trimmed = el.value.trim();

    control.setValue(trimmed);
  }

  removeFile() {
    this.file = undefined;

    const el = document.getElementById('file') as HTMLInputElement;
    if (el) el.value = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const control = this.reportIssueForm.get('issueScreenshotUrl');
    if (!control) return;
    if (file.size > this.FILE_SIZE_LIMIT) {
      control.setErrors({ sizeLimit: true });
      this.file = undefined;
    } else {
      control.setErrors(null);
      this.file = file;
    }
  }

  resetForm() {
    this.reportIssueForm.reset();
    this.removeFile();
  }

  submit() {
    if (!this.reportIssueForm.valid) return;

    const file = this.file;
    const payload = { ...this.reportIssueForm.getRawValue() };
    let upload$: Observable<string>;

    this.globalLoader.showLoader();

    if (file) {
      // Get signed URL.
      upload$ = this.fileService
        .getSignedUrl(file.name, file.type, 'report-an-issue')
        .pipe(
          switchMap((res: S3FileURLResponse) => {
            if (!res.success || !res.data?.length || !res.data[0].file_url) {
              return of('');
            }

            return this.fileService
              .uploadFileToS3(file, res.data[0].file_url)
              .pipe(map(() => res.data[0].path));
          }),
          catchError((err) => {
            console.error(err);
            return throwError(() => err);
          })
        );
    } else {
      upload$ = of('');
    }

    // Submit after file upload completes.
    upload$
      .pipe(
        switchMap((filePath) => {
          payload.issueScreenshotUrl = filePath || undefined;
          payload.autoCaptureContext = this.router.url;
          return this.reportIssueService.submitIssue(payload);
        }),
        finalize(() => this.globalLoader.hideLoader())
      )
      .subscribe({
        next: (res: ResponseData) => {
          if (res.message.length > 0) {
            this.apiResMsg.set(res.message.join(', '));
          }
          this.resetForm();
          this.file = undefined;
          this.utilityService.triggerSnackbar(this.apiResMsg() || 'Thank you!');
          setTimeout(() => {
            this.dialogRef.close();
          }, 800);
        },
        error: (err) => {
          if (err?.message?.length > 0) {
            this.apiResMsg.set(err.message.join(', '));
          }
          this.utilityService.triggerSnackbar(
            'Failed to send feedback, Please try again!',
            'snackbar-danger'
          );
        },
      });
  }
}
