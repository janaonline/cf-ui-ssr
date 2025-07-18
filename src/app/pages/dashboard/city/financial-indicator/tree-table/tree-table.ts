import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DataNode {
  name: string;
  yearData?: string[];
  children?: DataNode[];
}

const EXAMPLE_DATA: DataNode[] = [
  {
    name: 'Total',
    yearData: ['2021-22', '2022-23', '2021-22',],
    children: [
      { name: 'secure loan', yearData: ['2021-22', '2022-23', '2021-22',] },
      { name: 'unsecure', yearData: ['2021-22', '2022-23', '2021-22',] },
    ],
  },
  {
    name: 'Total 12',
    yearData: ['2021-22', '2022-23', '2021-22',],
    children: [
      { name: 'secure loan', yearData: ['2021-22', '2022-23', '2021-22',] },
      { name: 'unsecure', yearData: ['2021-22', '2022-23', '2021-22',] },
    ],
  },

];


@Component({
  selector: 'app-tree-table',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './tree-table.html',
  styleUrl: './tree-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeTable {

  dataSource = EXAMPLE_DATA;
  years = ['2021-22', '2022-23', '2021-22'];

  childrenAccessor = (node: DataNode) => node.children ?? [];

  hasChild = (_: number, node: DataNode) => !!node.children && node.children.length > 0;
}
