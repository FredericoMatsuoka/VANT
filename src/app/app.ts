import { Component, AfterViewInit, ElementRef, ChangeDetectionStrategy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { animate, scroll } from 'motion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Timeout to ensure DOM and fonts are fully settled
    setTimeout(() => this.setupAnimations(), 50);
  }

  private setupAnimations() {
    const q = (sel: string) => this.el.nativeElement.querySelector(sel) as HTMLElement | null;
    const qAll = (sel: string) => Array.from(this.el.nativeElement.querySelectorAll(sel)) as HTMLElement[];

    this.setupCustomCursor(q);
    
    // 1. Hero Parallax
    const heroTarget = q('#hero-section');
    if (heroTarget) {
      scroll(animate('#hero-image', { y: ['0%', '30%'], rotate: [-4, 0] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-1', { y: ['0px', '-46px'], rotate: [12, 4] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-2', { y: ['0px', '-54px'], rotate: [-12, -4] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-3', { y: ['0px', '-34px'], rotate: [-8, -2] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-4', { y: ['0px', '-38px'], rotate: [10, 3] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-5', { y: ['0px', '-30px'], rotate: [-14, -5] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-6', { y: ['0px', '-32px'], rotate: [14, 5] }), { target: heroTarget, offset: ['start start', 'end start'] });
    }

    // 2. Showcase Image Reveal
    const showcaseSection = q('#showcase-section');
    if (showcaseSection) {
      this.setupShowcase(showcaseSection, q('#showcase-img'), q('#showcase-text'));
    }

    // 3. Browser portfolio stack
    const portfolioSection = q('#portfolio-stack');
    if (portfolioSection) {
      this.setupPortfolioStack(portfolioSection, qAll('.browser-card'));
    }

    // 4. Horizontal Scroll Cards
    const servicosSection = q('#servicos');
    if (servicosSection) {
      scroll(animate('#cards-track', { x: ['0px', 'calc(-100% + 100vw)'] }), {
        target: servicosSection,
        offset: ['start start', 'end end']
      });
    }

    // 5. Game / Big Number Interactive Scroll
    const motionSection = q('#motion');
    if (motionSection) {
      const bigNumber = q('#big-number');
      const formatNumber = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
      
      scroll((info: any) => {
        if (bigNumber) {
          const progress = typeof info === 'number' ? info : (info.y?.progress || 0);
          const val = progress * 255000; 
          bigNumber.textContent = formatNumber(val);
          const scale = 0.8 + (progress * 0.4);
          bigNumber.style.transform = `scale(${scale})`;
        }
      }, { target: motionSection, offset: ['start end', 'end end'] });

      // Game copy specific fade and scale
      scroll(animate('#game-copy', { 
        y: ['150px', '0px', '-150px'],
        opacity: [0, 1, 0],
        scale: [0.9, 1, 1.1]
      }), {
        target: motionSection,
        offset: ['start center', 'center center', 'end start']
      });
    }

    // 5. Continuous float animations
    this.animateFloaters(q);
  }

  private setupCustomCursor(q: (sel: string) => HTMLElement | null) {
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const cursor = q('#custom-cursor');
    if (!cursor) {
      return;
    }

    let visible = false;
    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      rafId = null;
      cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      if (!visible) {
        cursor.classList.add('is-visible');
        visible = true;
      }
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (rafId === null) {
        rafId = requestAnimationFrame(render);
      }
    };

    const onLeave = () => {
      cursor.classList.remove('is-visible');
      visible = false;
    };

    const onDown = () => cursor.classList.add('is-down');
    const onUp = () => cursor.classList.remove('is-down');

    const onOver = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      if (target.closest('a, button, input, textarea, select, .price-button, .glass-pill')) {
        cursor.classList.add('is-hover');
      }
    };

    const onOut = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      if (target.closest('a, button, input, textarea, select, .price-button, .glass-pill')) {
        cursor.classList.remove('is-hover');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);
  }

  private setupPortfolioStack(section: HTMLElement, cards: HTMLElement[]) {
    if (!cards.length) {
      return;
    }

    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
    const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

    let ticking = false;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let targetVelocity = 0;
    let smoothVelocity = 0;

    const update = () => {
      ticking = false;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const mobileStretch = 1;
      const rawProgress = clamp(-rect.top / (scrollable * mobileStretch));
      const progressPower = 1;
      const progress = clamp(Math.pow(rawProgress, progressPower));
      const velocityScale = isMobile ? 120 : 220;

      smoothVelocity = smoothVelocity * 0.82 + targetVelocity * 0.18;
      targetVelocity *= 0.6;

      const velocityOffset = clamp(smoothVelocity * velocityScale, -80, 80);

      const revealSpan = isMobile ? 0.9 : 0.82;
      const step = revealSpan / cards.length;
      const exitStartFactor = isMobile ? 2.05 : 1.85;
      const exitSpanFactor = isMobile ? 1.35 : 1.28;

      cards.forEach((card, index) => {
        const local = easeOut((progress + 0.03 - index * step) / (step * 1.25));
        const isLastCard = index === cards.length - 1;
        const exit = isMobile && isLastCard
          ? 0
          : clamp((progress - (index * step + step * exitStartFactor)) / (step * exitSpanFactor));
        const wave = Math.max(0.2, 1 - index * 0.12);
        const y = mix(96, 0, local) + mix(0, -74, exit) + velocityOffset * wave;
        const scale = mix(1.035, 1, local);
        const opacity = local * (1 - exit * 0.18);

        card.style.setProperty('--open-y', `${y}px`);
        card.style.setProperty('--open-scale', `${scale}`);
        card.style.setProperty('--open-opacity', `${opacity}`);
      });
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onScroll = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY;
      const dt = Math.max(16, now - lastTime);
      targetVelocity = dy / dt;
      lastScrollY = currentY;
      lastTime = now;
      requestUpdate();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  private setupShowcase(section: HTMLElement, image: HTMLElement | null, text: HTMLElement | null) {
    const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
    const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

    let ticking = false;

    const update = () => {
      ticking = false;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = clamp(-rect.top / scrollable);
      const intro = easeOut(progress / 0.34);
      const outro = easeOut((progress - 0.68) / 0.28);

      if (image) {
        image.style.transform = `scale(${mix(1.2, 1.03, intro)})`;
        image.style.opacity = `${mix(0.26, 0.64, intro) * (1 - outro * 0.35)}`;
      }

      if (text) {
        const y = mix(72, 0, intro) + mix(0, -84, outro);
        const scale = mix(0.88, 1, intro) + outro * 0.06;
        text.style.opacity = `${intro * (1 - outro)}`;
        text.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  private animateFloaters(q: (sel: string) => HTMLElement | null) {
    const float = (sel: string, yRange: number[], duration: number, delay: number) => {
      const el = q(sel);
      if (el) {
        animate(el as any, { y: yRange }, {
          duration,
          delay,
          repeat: Infinity,
          direction: 'alternate' as "alternate",
          easing: "ease-in-out"
        } as any);
      }
    };

    float('#tag-1', [-15, 15], 3, 0);
    float('#tag-2', [-20, 20], 3.5, 0.5);
    float('#tag-3', [15, -15], 4, 1);
    float('#tag-4', [20, -20], 3.2, 0.2);
    float('#hero-card-1', [-8, 10], 4.2, 0);
    float('#hero-card-2', [10, -8], 4.8, 0.4);
    float('#hero-card-3', [-10, 8], 5, 0.8);
    float('#hero-card-4', [8, -10], 4.4, 0.2);
    float('#hero-card-5', [-7, 9], 5.2, 0.6);
  }
}
