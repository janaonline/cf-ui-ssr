import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/template/header/header';
import { Footer } from './shared/components/template/footer/footer';
import { FeedbackWidget } from './shared/components/feedback-widget/feedback-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, FeedbackWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'cf-ui-ssr';
}
