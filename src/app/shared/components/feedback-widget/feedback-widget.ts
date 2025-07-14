import { Component } from '@angular/core';
import { animate, style, transition, trigger } from "@angular/animations";
import { Subscription } from 'rxjs';
import { FeedbackWidgetService } from './feedback-widget.service';

@Component({
  selector: 'app-feedback-widget',
  imports: [],
  templateUrl: './feedback-widget.html',
  styleUrl: './feedback-widget.scss',
  animations: [
    trigger("slideIn", [
      transition(":enter", [
        style({ transform: "translateY(-150%)" }),
        animate("600ms ease-out", style({ transform: "translateY(0%)" })),
      ]),
      transition(":leave", [
        animate("200ms ease-in", style({ transform: "translateY(-100%)" })),
      ]),
    ]),
  ],
})
export class FeedbackWidget {

  public showFeedbackWidget: boolean = true;
  private sub!: Subscription;
  private readonly formLink =
    "https://docs.google.com/forms/d/18eFx_KNwPIhbIB2BaEM4y3BneFqKWIPYMwB2hZGuU_g/edit#responses";

  constructor(private feedbackWidgetService: FeedbackWidgetService) { }

  ngOnInit(): void {
    this.sub = this.feedbackWidgetService.onRouteChange.subscribe(
      (showFeedback: boolean) => {
        this.showFeedbackWidget = showFeedback;
        // console.log("show feedback widget = ", this.showFeedbackWidget);
      }
    );
  }

  public openFeedbackForm(): void {
    window.open(this.formLink, "_blank");
  }

  public closeFeedbackWidget(event: Event): void {
    event.stopPropagation();
    this.showFeedbackWidget = false;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
