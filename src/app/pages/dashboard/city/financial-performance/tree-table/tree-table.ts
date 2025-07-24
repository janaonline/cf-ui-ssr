import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface DataNode {
  name: string;
  info?: string;
  yearData?: string[];
  children?: DataNode[];
}

const Financial_Performance_DATA: DataNode[] = [
  {
    name: 'Total Expenditure to Total Revenue (%)',
    yearData: ['56', '98', '78',],
    info: 'Total Expenditure to Total Revenue (%)',
    children: [
      {
        name: 'Total Expenditure to Total Revenue (%)',
        yearData: ['78', '56', '88',],
        info: 'Total Expenditure to Total Revenue (%)'
      },
      { name: 'Own Source revenue to Total Revenue (%)', yearData: ['55', '87', '89',] },
    ],
  },
  {
    name: 'Grants to Total Revenue (%)',
    info: 'Total Expenditure to Total Revenue (%)',
    yearData: ['90', '45', '67',],
    children: [
      {
        name: 'Total Expenditure to Total Revenue (%)',
        yearData: ['78', '56', '88',],
        info: 'Total Expenditure to Total Revenue (%)'
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89',],
        info: 'Own Source revenue to Total Revenue (%)'
      },
    ],
  },
  {
    name: 'Own Source Revenue to Total Expenditure (%)',
    yearData: ['78', '44', '90',],
    info: 'Total Expenditure to Total Revenue (%)',
    children: [
      {
        name: 'Total Expenditure to Total Revenue (%)',
        yearData: ['78', '56', '88',],
        info: 'Total Expenditure to Total Revenue (%)'
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89',],
        info: 'Own Source revenue to Total Revenue (%)'
      },
    ],
  },
  {
    name: 'Own Source Revenue to Total Expenditure (%)',
    yearData: ['78', '44', '90',],
    info: 'Total Expenditure to Total Revenue (%)',
    children: [
      {
        name: 'Total Expenditure to Total Revenue (%)',
        yearData: ['78', '56', '88',],
        info: 'Total Expenditure to Total Revenue (%)'
      },
      {
        name: 'Own Source revenue to Total Revenue (%)',
        yearData: ['55', '87', '89',],
        info: 'Own Source revenue to Total Revenue (%)'
      },
    ],
  },

];


@Component({
  selector: 'app-tree-table',
  imports: [MatTreeModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './tree-table.html',
  styleUrl: './tree-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTable {

  dataSource = Financial_Performance_DATA;
  years = ['2021-22', '2022-23', '2021-22'];

  childrenAccessor = (node: DataNode) => node.children ?? [];

  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;
}
