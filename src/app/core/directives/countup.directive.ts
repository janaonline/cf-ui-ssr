import { isPlatformBrowser } from '@angular/common';
import {
    Directive,
    ElementRef,
    Inject,
    Input,
    OnChanges,
    PLATFORM_ID,
    SimpleChanges,
    inject,
} from '@angular/core';

@Directive({
    selector: '[appCountUp]',
    standalone: true,
})
export class CountUpDirective implements OnChanges {
    @Input() start = 0;
    @Input() end = 100;
    @Input() duration = 2000;

    @Input() useEasing = true;
    @Input() smartEasingThreshold = 1000;
    @Input() smartEasingAmount = 200;

    private el = inject(ElementRef);
    private startTime: number | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['start'] || changes['end'] || changes['duration']) {
            this.startAnimation();
        }
    }

    private easeOutQuad(t: number): number {
        return t * (2 - t); // easing slows at end
    }

    private startAnimation() {
        if (!isPlatformBrowser(this.platformId)) return;
        const totalChange = this.end - this.start;
        const isSmartEasing =
            this.useEasing && Math.abs(totalChange) > this.smartEasingThreshold;

        if (isSmartEasing) {
            // Break into two parts:
            const midValue =
                this.end - Math.sign(totalChange) * this.smartEasingAmount;

            const duration1 = this.duration * 0.5;
            const duration2 = this.duration - duration1;

            // Part 1: Linear
            this.animate(this.start, midValue, duration1, false, () => {
                // Part 2: Eased
                this.animate(midValue, this.end, duration2, true);
            });
        } else {
            // Normal animation (with optional easing)
            this.animate(this.start, this.end, this.duration, this.useEasing);
        }
    }

    private animate(
        from: number,
        to: number,
        duration: number,
        easing: boolean,
        onComplete?: () => void
    ) {
        const range = to - from;
        this.startTime = null;

        const step = (timestamp: number) => {
            if (!this.startTime) this.startTime = timestamp;
            const elapsed = timestamp - this.startTime;
            const progress = Math.min(elapsed / duration, 1);
            const t = easing ? this.easeOutQuad(progress) : progress;
            const current = from + range * t;

            this.el.nativeElement.innerText = Math.floor(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                this.el.nativeElement.innerText = Math.floor(to);
                if (onComplete) onComplete();
            }
        };

        requestAnimationFrame(step);
    }
}
