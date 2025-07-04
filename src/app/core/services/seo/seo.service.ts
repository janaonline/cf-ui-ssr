import { Injectable, Inject, PLATFORM_ID, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private renderer: Renderer2;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  updateTitle(title: string): void {
    this.titleService.setTitle(title);
  }

  updateMetaTags(tags: { name?: string, property?: string, content: string }[]): void {
    tags.forEach(tag => this.metaService.updateTag(tag));
  }

  setJsonLd(schema: object): void {
    if (isPlatformBrowser(this.platformId)) {
      const script = this.renderer.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      this.removeOldJsonLd(); // Optional: clean previous tags
      this.renderer.appendChild(document.head, script);
    }
  }

  private removeOldJsonLd() {
    const existing = document.head.querySelectorAll('script[type="application/ld+json"]');
    existing.forEach(el => el.remove());
  }
}
