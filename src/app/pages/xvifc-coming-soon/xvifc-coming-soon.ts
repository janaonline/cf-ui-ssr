import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';

// XVIFC_PROD_CUTOVER: this whole page (this file + its .html/.scss) becomes obsolete once the real
// 16th FC login is ready for production — delete this folder along with the route that loads it
// in app.routes.ts and the hardcoded row that links to it in navbar.html.
@Component({
  selector: 'app-xvifc-coming-soon',
  imports: [RouterLink],
  templateUrl: './xvifc-coming-soon.html',
  styleUrl: './xvifc-coming-soon.scss'
})
export class XvifcComingSoon {
  private readonly sanitizer = inject(DomSanitizer);

  trust = (html: string): SafeHtml => this.sanitizer.bypassSecurityTrustHtml(html);
  cfLink = `<a href="http://cityfinance.in/" target="_blank" rel="noopener">cityfinance.in</a>`;

  readonly panelContent = {
    titleLine1: '16th Finance Commission',
    titleLine2: 'Grant Management System',
    descriptions: [
      {
        html: this.trust(
          `${this.cfLink} is the official grant management system for the Sixteenth Finance Commission (XVI-FC) grants to Urban Local Bodies in India. Under MoHUA oversight, the platform handles ₹3,56,357 crore in grants for fiscal years 2026–2031.`,
        ),
      },
      {
        html: this.trust(
          `The platform facilitates smooth communication and data exchange between ULBs, State Urban Development Departments (UDDs), and MoHUA, ensuring efficiency and transparency.`,
        ),
        secondary: true,
      },
    ],
    documents: [{
      key: 'document1',
      label: 'View Operational Guidelines',
      link: `${environment.baseUrl}/assets/docs/Operational_Guidelines_2026-31.pdf`,
    }]
  }

  readonly stats = [
    { label: 'Eligible Urban Local Bodies', value: '4,485', icon: 'bi-buildings-fill' },
    { label: 'Special Grant Categories', value: '2', icon: 'bi-tags-fill' },
    { label: 'Total Grants Allocated', value: '₹3,56,357 Cr', icon: 'bi-cash-stack' },
    { label: 'Year 1 Disbursement', value: '₹37,272 Cr', icon: 'bi-send-fill' },
  ] as const;
}
