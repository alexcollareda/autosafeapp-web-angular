import { Component, OnInit } from '@angular/core';
import { PromotionsService, Promotion, CtaButtonType } from '../services/promotions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-promotions',
  templateUrl: './my-promotions.component.html',
  styleUrls: ['./my-promotions.component.scss']
})
export class MyPromotionsComponent implements OnInit {
  loading = false;
  errorMsg = '';
  search = '';
  items: Promotion[] = [];

  constructor(private promos: PromotionsService, private router: Router) {}

  ngOnInit(): void { this.fetch(); }

  fetch() {
    this.loading = true;
    this.errorMsg = '';
    this.promos.listMine().subscribe({
      next: (list) => { this.items = list || []; this.loading = false; },
      error: (e) => {
        this.errorMsg = e?.error?.message || 'Falha ao carregar promoções.';
        this.loading = false;
      }
    });
  }

  get filtered(): Promotion[] {
    const q = (this.search || '').toLowerCase();
    return this.items.filter(p =>
      !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }

  ctaLabel(t: CtaButtonType): string {
    switch (t) {
      case 'SEE_MORE':   return 'Ver mais';
      case 'BOOK_NOW':   return 'Reservar';
      case 'CONTACT_US': return 'Fale conosco';
      default:           return 'Ver mais';
    }
  }

  isActive(p: Promotion): boolean {
    const today = new Date(); today.setHours(0,0,0,0);
    const s = new Date(p.startDate);
    const e = new Date(p.endDate);
    return s <= today && e >= today;
  }

  openCreate() {
    // mantido por compatibilidade, mas o botão usa routerLink
    this.router.navigateByUrl('/app/new-promotions');
  }

  openEdit(p: Promotion) {
    // edição no MESMO componente, via query param
    this.router.navigateByUrl(`app/new-promotions?promotionId=${p.id}`);
  }

  openAction(p: Promotion) {
    if (p.promotionType === 'EXTERNAL_LINK' && p.targetUrl) {
      window.open(p.targetUrl, '_blank');
    }
  }
}
