import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { MaterialModule } from "../../../material.module";

@Component({
  selector: 'app-data-sets-bulk-download',
  imports: [MatInputModule, MaterialModule],
  templateUrl: './data-sets-bulk-download.html',
  styleUrl: './data-sets-bulk-download.scss'
})
export class DataSetsBulkDownload {
  downloadForm!: FormGroup;
  ulbsList: Partial<IULB>[] = [
    {
      _id: '1',
      code: 'Code 1',
      name: 'ULB 1',
    },
    {
      _id: '2',
      code: 'Code 2',
      name: 'ULB 2',
    },
    {
      _id: '3',
      code: 'Code 3',
      name: 'ULB 3',
    }
  ];
  statesList: Partial<IState>[] = [
    {
      _id: '1',
      code: 'Code 1',
      name: 'State 1',
    },
    {
      _id: '2',
      code: 'Code 2',
      name: 'State 2',
    },
    {
      _id: '3',
      code: 'Code 3',
      name: 'State 3',
    }
  ];
  yearsList: string[] = ['2023-24', '2022-23', '2021-22'];
  downloadOptions = [
    {
      value: 'rawPdf',
      label: 'Data submitted by ULBs',
      description: 'in PDF'
    },
    {
      value: 'standardizedExcel',
      label: 'Data standardized by City Finance',
      description: 'in Excel'
    },
    {
      value: 'budget',
      label: 'Budget data submitted by ULBs',
      description: 'in PDF'
    }
  ];


  constructor(
    private fb: FormBuilder
  ) {
    this.downloadForm = this.fb.group({
      states: [],
      ulbs: [[]],
      year: ['2023-24'],
      downloadType: ['rawPdf'] // 'rawPdf' | 'standardizedExcel' | 'budget'
    });
  }

}