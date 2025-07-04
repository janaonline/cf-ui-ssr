import { Injectable, signal, computed } from '@angular/core';
// import { StateData, Ulb } from './models'; // your interfaces
import { HttpClient } from '@angular/common/http';
import { IULB } from '../../models/ulb';
import { IState } from '../../models/state/state';
import { environment } from '../../../../environments/environment';
import { IStateListResponse } from '../../models/state/state-response';
import { IULBResponse } from '../../models/IULBResponse';

@Injectable({ providedIn: 'root' })
export class UlbService {
  private statesSignal = signal<IState[]>([]);
  private ulbsSignal = signal<IULB[]>([]);
  private selectedStateId = signal<string | null>(null);
  private selectedUlb = signal<IULB | null>(null);

  constructor(private http: HttpClient) { }

  // Expose signals as read-only
  readonly states = this.statesSignal.asReadonly();
  readonly ulbs = this.ulbsSignal.asReadonly();
  readonly selectedState = this.selectedStateId.asReadonly();

  readonly filteredUlbs = computed(() => {
    const selectedId = this.selectedStateId();
    return selectedId
      ? this.ulbsSignal().filter(ulb => ulb.state._id === selectedId)
      : [];
  });

  // API fetch methods
  fetchStates(): void {
    this.http.get<IStateListResponse>(environment.api.url + 'state').subscribe(res => {
      if (res.success) this.statesSignal.set(res.data);
    });
  }

  fetchUlbs(): void {
    this.http.get<IULBResponse>('api/ulb-list').subscribe(res => {
      if (res.success) this.ulbsSignal.set(res.data);
    });
  }

  // Update selected state
  setSelectedState(id: string): void {
    this.selectedStateId.set(id);
  }
}
