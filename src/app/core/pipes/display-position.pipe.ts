import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayPosition',
  standalone: true,
})
export class DisplayPositionPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): unknown {
    if (!('' + value).includes('.')) return value;
    const [digit, mentissa] = ('' + value).split('.');
    return `${digit}.${mentissa.split('').join('.')}`;
  }
}
