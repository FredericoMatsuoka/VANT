import { Component, AfterViewInit, ElementRef, ChangeDetectionStrategy } from '@angular/core';
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
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    // Timeout to ensure DOM and fonts are fully settled
    setTimeout(() => this.setupAnimations(), 50);
  }

    private setupAnimations() {
    const q = (sel: string) => this.el.nativeElement.querySelector(sel) as HTMLElement | null;
    
    // 1. Hero Parallax
    const heroTarget = q('#hero-section');
    if (heroTarget) {
      scroll(animate('#hero-image', { y: ['0%', '30%'], rotate: [-4, 0] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-1', { y: ['0px', '-100px'], rotate: [-12, -2] }), { target: heroTarget, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-2', { y: ['0px', '-150px'], rotate: [15, 5] }), { target: heroTarget, offset: ['start start', 'end start'] });
    }

    // 2. Showcase Image Reveal
    const showcaseSection = q('#showcase-section');
    if (showcaseSection) {
       scroll(animate('#showcase-img', { scale: [1.25, 1], opacity: [0.3, 0.8] }), { target: showcaseSection, offset: ['start end', 'end end'] });
       scroll(animate('#showcase-text', { scale: [0.85, 1], y: ['80px', '0px'] }), { target: showcaseSection, offset: ['start end', 'end end'] });
       scroll(animate('#showcase-text', { opacity: [1, 0], y: ['0px', '-100px'] }), { target: showcaseSection, offset: ['end center', 'end start'] });
    }

    // 3. Horizontal Scroll Cards
    const servicosSection = q('#servicos');
    if (servicosSection) {
      scroll(animate('#cards-track', { x: ['0px', 'calc(-100% + 100vw)'] }), {
        target: servicosSection,
        offset: ['start start', 'end end']
      });
    }

    // 4. Game / Big Number Interactive Scroll
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
    
    float('#sticker-1', [-10, 10], 4, 0);
    float('#sticker-2', [15, -15], 5, 0.5);
  }
}

