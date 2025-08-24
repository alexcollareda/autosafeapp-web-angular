import { Component, OnInit } from '@angular/core';

interface Promotion {
  id: number;
  title: string;
}

export interface IAlert {
  id: number;
  type: string;
  strong?: string;
  message: string;
  icon?: string;
}

@Component({
  selector: 'app-new-promotions',
  templateUrl: './new-promotions.component.html',
  styleUrls: ['./new-promotions.component.scss']
})
export class NewPromotionsComponent implements OnInit {
  promotion: Promotion = {} as Promotion;
  public alerts: Array<IAlert> = [];

  constructor() { }

  ngOnInit(): void {
  }

  savePromotion() {

  }

}
