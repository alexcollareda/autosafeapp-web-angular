import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    focus;
    focus1;
    companyName: any;
    constructor(private authService: AuthService) {
  
    }

  ngOnInit(): void {
    this.companyName = this.authService.getCompanyName();
  }


}
