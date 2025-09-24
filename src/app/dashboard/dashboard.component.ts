import { ReviewService } from './../services/review.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { ServicesService } from 'app/services/services.service';
import { MetricsService } from 'app/services/metrics.service';
import { OperatingHoursService } from 'app/services/operating-hours.service';
import { Router } from '@angular/router';

export interface Informative {
  message: string;
  action?: () => void;
}
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
    callCount: number = 0;
    viewCount: number = 0;
    informatives: Informative[] = [];

    constructor(private authService: AuthService, private servicesService: ServicesService, private reviewService: ReviewService, private metricsService:MetricsService, private operatingHoursService: OperatingHoursService,
    private router: Router) {   
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

    this.metricsService.getMetricsToday().subscribe(
      (data) => {
        this.viewCount = data.companyView;
        this.callCount = data.clickPhoneCompany;
      });
    

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
    this.operatingHoursService.getOperatingHours().subscribe({
  next: (data) => {
    if (!data || data.length === 0) {
      this.informatives.push({
        message: "Você não possui horário de funcionamento cadastrado, Atualize!",
        action: () => this.goToMyCompanyTab('horario')
      });
    }
  },
  error: (err) => {
    console.error('Erro ao buscar horários de funcionamento:', err);
    // Se o backend deu 500, adiciona o mesmo informativo
    this.informatives.push({
      message: "Você não possui horário de funcionamento cadastrado, Atualize!",
      action: () => this.goToMyCompanyTab('horario')
    });
  }
});
  }

  goToMyCompanyTab(tab: string) {
  this.router.navigate(['/app/my-company'], { queryParams: { tab } });
}
}
