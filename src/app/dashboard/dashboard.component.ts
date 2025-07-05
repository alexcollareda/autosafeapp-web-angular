import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    auth: AuthService;
    constructor(private authService: AuthService) {
        this.auth = authService
    }

  ngOnInit(): void {
  }

    logout() {
        this.auth.logout();
        window.location.href = '/examples/login'; // Redireciona para a página de login
    } 

}
