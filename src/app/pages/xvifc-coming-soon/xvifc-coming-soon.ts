import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

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
      label: 'XVI FC Operational Guidelines',
      link: 'https://www.cityfinance.in/api/v1/resourceDashboard/download/698472008670dfe40327596d',
    }]
  }

  readonly stats = [
    { label: 'Eligible Urban Local Bodies', value: '4,485', icon: 'bi-buildings-fill' },
    { label: 'Special Grant Categories', value: '2', icon: 'bi-tags-fill' },
    { label: 'Total Grants Allocated', value: '₹1,29,987 Cr', icon: 'bi-cash-stack' },
    { label: 'Year 1 Disbursement', value: '₹37,272 Cr', icon: 'bi-send-fill' },
  ] as const;
}
