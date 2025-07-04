import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alreadyUpdatedUrl',
  standalone: true,
})
export class AlreadyUpdatedUrlPipe implements PipeTransform {
  transform(year: string, stateCode: string, ulbName: string, ulbId: string): unknown {
    return `/resources-dashboard/data-sets/balanceSheet?ulbName=${ulbName}&ulbId=${ulbId}&stateCode=${stateCode}&year=${year?.split(' ')?.[1]}`;
  }
}
