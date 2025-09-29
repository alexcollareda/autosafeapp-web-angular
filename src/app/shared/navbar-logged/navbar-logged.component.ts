import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from 'app/services/auth.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-navbar-logged',
  templateUrl: './navbar-logged.component.html',
  styleUrls: ['./navbar-logged.component.scss']
})
export class NavbarLoggedComponent implements OnInit {
  private toggleButton: any;
  private sidebarVisible: boolean;
  enableCalendar: boolean;
  enablePromotions: boolean;

  constructor(private element: ElementRef, private authService: AuthService) { }

  ngOnInit(): void {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
    if(environment){
      this.enableCalendar = environment.enableCalendar;
      this.enablePromotions = environment.enablePromotions;
    }
  }

  logout() {
    this.authService.logout();
    window.location.href = '/public/login';
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const html = document.getElementsByTagName('html')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);
    html.classList.add('nav-open');

    this.sidebarVisible = true;
  };
  sidebarClose() {
    const html = document.getElementsByTagName('html')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    html.classList.remove('nav-open');
  };
  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };

}
