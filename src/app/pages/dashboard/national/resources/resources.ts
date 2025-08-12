import { Component, signal } from '@angular/core';
import { NationalService } from '../national.service';
import { ToStorageUrlPipe } from "../../../../core/pipes/to-storage-url.pipe";

@Component({
  selector: 'app-resources',
  imports: [ToStorageUrlPipe],
  templateUrl: './resources.html',
  styleUrl: './resources.scss'
})
export class Resources {

  resourceData = signal<any[]>([]);

  constructor(private nationalService: NationalService) { }

  ngOnInit(): void {
    this.getResource();
  }

  getResource() {
    this.nationalService.getResource().subscribe(
      {
        next: (res: any) => {
          console.log("res", res);
          this.resourceData.set(res.data.data);
        },
        error: () => { },
        complete: () => { }
      });
  }

}
