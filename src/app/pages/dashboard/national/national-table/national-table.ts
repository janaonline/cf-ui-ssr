import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-national-table',
  imports: [MatTableModule],
  templateUrl: './national-table.html',
  styleUrl: './national-table.scss'
})
export class NationalTable {
  @Input() headers!: any[];
  @Input() dataSource!: any[];
  @Input() displayedColumns!: any[];
}
