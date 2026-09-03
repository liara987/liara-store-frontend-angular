import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

export interface CarouselSlide {
  imageUrl: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  bgColor?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="carousel"
      role="region"
      aria-label="Banners promocionais"
      (mouseenter)="pauseAutoplay()"
      (mouseleave)="resumeAutoplay()"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
    >
      <!-- Slides -->
      <div class="carousel-track" [style.transform]="'translateX(-' + current() * 100 + '%)'">
        @for (slide of slides; track $index) {
          <div
            class="carousel-slide"
            [style.background]="slide.bgColor || 'var(--brand-soft)'"
            [attr.aria-hidden]="$index !== current()"
          >
            <img
              [src]="slide.imageUrl"
              [alt]="slide.alt"
              class="slide-image"
              [attr.loading]="$index === 0 ? 'eager' : 'lazy'"
              [attr.fetchpriority]="$index === 0 ? 'high' : null"
              decoding="async"
            />
            @if (slide.title || slide.subtitle || slide.ctaLabel) {
              <div class="slide-content">
                @if (slide.title) {
                  <h2 class="slide-title">{{ slide.title }}</h2>
                }
                @if (slide.subtitle) {
                  <p class="slide-subtitle">{{ slide.subtitle }}</p>
                }
                @if (slide.ctaLabel && slide.ctaLink) {
                  <a [href]="slide.ctaLink" class="slide-cta">{{ slide.ctaLabel }}</a>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Botão anterior -->
      <button class="carousel-btn prev" type="button" aria-label="Slide anterior" (click)="prev()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Botão próximo -->
      <button class="carousel-btn next" type="button" aria-label="Próximo slide" (click)="next()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Indicadores -->
      <div class="carousel-dots" role="tablist" aria-label="Slides">
        @for (slide of slides; track $index) {
          <button
            role="tab"
            class="dot"
            [class.active]="$index === current()"
            [attr.aria-selected]="$index === current()"
            [attr.aria-label]="'Ir para slide ' + ($index + 1)"
            (click)="goTo($index)"
            type="button"
          ></button>
        }
      </div>
    </div>
  `,
  styles: `
    .carousel {
      position: relative;
      overflow: hidden;
      background: var(--brand-soft);
      aspect-ratio: 16 / 6;
      margin-bottom: 1.5rem;
      user-select: none;
    }

    @media (max-width: 600px) {
      .carousel {
        aspect-ratio: 16 / 9;
      }
    }

    .carousel-track {
      display: flex;
      height: 100%;
      transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }

    .carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .slide-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .slide-content {
      position: relative;
      z-index: 2;
      padding: 1.5rem 2rem 1.5rem 4rem;
      max-width: 55%;
      background: linear-gradient(90deg, rgba(0, 0, 0, 0.55) 0%, transparent 100%);
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .slide-content {
        max-width: 100%;
        padding: 1rem 1.25rem 1rem 4rem;
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, transparent 60%);
        justify-content: flex-end;
      }
    }

    .slide-title {
      margin: 0;
      color: #fff;
      font-size: clamp(1.1rem, 3vw, 1.8rem);
      font-weight: 800;
      line-height: 1.2;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .slide-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: clamp(0.85rem, 2vw, 1rem);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .slide-cta {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 0.55rem 1.25rem;
      min-height: 40px;
      font-size: 0.9rem;
      background: #fff;
      color: var(--brand-dark);
      border-radius: 999px;
      font-weight: 700;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    }

    .slide-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 5;
      border: none;
      background: rgba(255, 255, 255, 0.92);
      color: #333;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition:
        background 0.15s ease,
        transform 0.15s ease;
      padding: 0;
    }

    .carousel-btn:hover {
      background: #fff;
      transform: translateY(-50%) scale(1.1);
    }

    .carousel-btn.prev {
      left: 0.75rem;
    }
    .carousel-btn.next {
      right: 0.75rem;
    }

    @media (max-width: 480px) {
      .carousel-btn {
        width: 34px;
        height: 34px;
      }
      .carousel-btn svg {
        width: 18px;
        height: 18px;
      }
    }

    .carousel-dots {
      position: absolute;
      bottom: 0.75rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.45rem;
      z-index: 5;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 0;
      transition:
        background 0.2s ease,
        width 0.2s ease;
    }

    .dot.active {
      background: #fff;
      width: 22px;
      border-radius: 4px;
    }
  `,
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() autoplayInterval = 4500;

  protected readonly current = signal(0);

  private timer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private paused = false;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  protected next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
  }

  protected prev(): void {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  protected goTo(index: number): void {
    this.current.set(index);
  }

  protected pauseAutoplay(): void {
    this.paused = true;
    this.stopAutoplay();
  }

  protected resumeAutoplay(): void {
    this.paused = false;
    this.startAutoplay();
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.pauseAutoplay();
  }

  protected onTouchEnd(event: TouchEvent): void {
    const diff = this.touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? this.next() : this.prev();
    }
    this.resumeAutoplay();
  }

  private startAutoplay(): void {
    if (this.slides.length <= 1 || this.paused) return;
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.autoplayInterval);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
