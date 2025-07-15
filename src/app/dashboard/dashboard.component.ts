import { ReviewService } from './../services/review.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { ServicesService } from 'app/services/services.service';

export interface Review{
  rate:number;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    focus;
    focus1;
    companyName: any;
    countServices: number = 0;
    reviews : Review[] = [];
    countReviews: number = 0;
    averageRate: number = 0;

    constructor(private authService: AuthService, private servicesService: ServicesService, private reviewService: ReviewService) {   
    }

  ngOnInit(): void {
    this.companyName = this.authService.getCompanyName();
    this.servicesService.countActiveServices().subscribe(
      (data) => {
        this.countServices = data;
      },
      (error) => {
        console.error('Erro ao contar serviços ativos:', error);
      }
    );

    this.reviewService.findMyReviews().subscribe(
      (data) => {

        this.reviews = data;
        this.averageRate = this.reviews.reduce((sum, review) => sum + review.rate, 0) / this.reviews.length || 0;
        this.countReviews = this.reviews.length;
      },
      (error) => {  
        console.error('Erro ao buscar reviews:', error);
      } 
    );
  }


}
