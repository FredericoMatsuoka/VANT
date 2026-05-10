import {
  Component, AfterViewInit, ElementRef,
  ChangeDetectionStrategy, PLATFORM_ID, Inject,
  signal, HostListener
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { animate, scroll, inView } from 'motion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  isModalOpen  = signal(false);
  formSubmitted = signal(false);

  // ─── Replace with actual WhatsApp number ───
  private readonly WA_NUMBER = '5511999999999';

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  @HostListener('document:keydown.escape')
  onEscape() { if (this.isModalOpen()) this.closeModal(); }

  openModal() {
    this.isModalOpen.set(true);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.formSubmitted.set(false);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  submitForm(e: Event) {
    e.preventDefault();
    const fd  = new FormData(e.target as HTMLFormElement);
    const nome = fd.get('nome')      as string;
    const email = fd.get('email')    as string;
    const tipo  = fd.get('tipo')     as string;
    const msg   = fd.get('mensagem') as string;

    const waText = `Olá! Me chamo *${nome}* (${email}).\nTipo de projeto: *${tipo}*\n\n${msg}`;
    window.open(`https://wa.me/${this.WA_NUMBER}?text=${encodeURIComponent(waText)}`, '_blank');
    this.formSubmitted.set(true);
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.hideLoader();
      this.initLenis();
      this.setupAnimations();
      this.setupMagneticButtons();
    }, 50);
  }

  private hideLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('loader-hidden'), 1800);
  }

  private initLenis() {
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    });
  }

  private setupMagneticButtons() {
    document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform =
          `translate(${(e.clientX - r.left - r.width  / 2) * 0.25}px,` +
                    `${(e.clientY - r.top  - r.height / 2) * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  private setupAnimations() {
    const q = (sel: string) => document.querySelector<HTMLElement>(sel);

    // 1. Hero Parallax
    const hero = q('#hero-section');
    if (hero) {
      scroll(animate('#hero-image', { y: ['0%', '30%'], rotate: [-2, 2] }),
        { target: hero, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-1', { y: ['0px', '-80px'], rotate: [-12, -2] }),
        { target: hero, offset: ['start start', 'end start'] });
      scroll(animate('#sticker-2', { y: ['0px', '-120px'], rotate: [15, 5] }),
        { target: hero, offset: ['start start', 'end start'] });
    }

    // 2. Showcase Reveal
    const showcase = q('#showcase-section');
    if (showcase) {
      scroll(animate('#showcase-img', { scale: [1.25, 1.05], opacity: [0.2, 0.7] }),
        { target: showcase, offset: ['start end', 'end end'] });
      scroll(animate('#showcase-text', { scale: [0.85, 1], y: ['60px', '0px'], opacity: [0, 1] }),
        { target: showcase, offset: ['start end', '60% end'] });
      scroll(animate('#showcase-text', { opacity: [1, 0], y: ['0px', '-80px'] }),
        { target: showcase, offset: ['end center', 'end start'] });
    }

    // 3. Horizontal Cards — clamp so it never overshoots
    const servicos = q('#servicos');
    if (servicos) {
      scroll(animate('#cards-track', { x: ['0px', 'calc(-100% + 100vw)'] }),
        { target: servicos, offset: ['start start', 'end end'] });
    }

    // 4. Big Number Counter
    const motion = q('#motion');
    if (motion) {
      const bigNum = q('#big-number');
      const fmt = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
      scroll((info: any) => {
        if (!bigNum) return;
        const p = info?.y?.progress ?? (typeof info === 'number' ? info : 0);
        bigNum.textContent = fmt(p * 255000);
        bigNum.style.transform = `scale(${0.8 + p * 0.4})`;
      }, { target: motion, offset: ['start end', 'end end'] });

      scroll(animate('#game-copy', {
        y:       ['120px', '0px',  '-120px'],
        opacity: [0,       1,       0],
        scale:   [0.92,    1,       1.06],
      }), { target: motion, offset: ['start center', 'center center', 'end start'] });
    }

    this.setupCaseCards();
    this.animateFloaters();
  }

  private setupCaseCards() {
    document.querySelectorAll<HTMLElement>('.case-wrapper').forEach(wrapper => {
      const inner = wrapper.querySelector<HTMLElement>('.case-card-inner');
      if (!inner) return;
      inView(wrapper, () => {
        animate(inner,
          { y: [300, 50] },
          { type: 'spring', bounce: 0.4, duration: 0.8 } as any
        );
      }, { amount: 0.8 });
    });
  }

  private animateFloaters() {
    const float = (sel: string, y: number[], dur: number, delay: number) => {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) animate(el as any, { y }, { duration: dur, delay, repeat: Infinity, direction: 'alternate', easing: 'ease-in-out' } as any);
    };
    float('#tag-1',     [-15,  15], 3.0, 0.0);
    float('#tag-2',     [-20,  20], 3.5, 0.5);
    float('#tag-3',     [ 15, -15], 4.0, 1.0);
    float('#tag-4',     [ 20, -20], 3.2, 0.2);
    float('#sticker-1', [-10,  10], 4.0, 0.0);
    float('#sticker-2', [ 15, -15], 5.0, 0.5);
  }
}
