import { Component, OnInit, Inject, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { NavbarLoggedComponent } from 'app/shared/navbar-logged/navbar-logged.component';

@Component({
  selector: 'app-logged-in-layout',
  templateUrl: './logged-in-layout.component.html',
  styleUrls: ['./logged-in-layout.component.scss']
})
export class LoggedInLayoutComponent implements OnInit {
   private _router: Subscription;
    @ViewChild(NavbarLoggedComponent) navbar: NavbarLoggedComponent;

    constructor( private renderer : Renderer2, private router: Router, @Inject(DOCUMENT,) private document: any, private element : ElementRef, public location: Location) {}
    ngOnInit() {
       
        var navbar : HTMLElement = this.element.nativeElement.children[0].children[0];
        navbar.classList.remove('navbar-transparent');
        this._router = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            if (window.outerWidth > 991) {
                window.document.children[0].scrollTop = 0;
            }else{
                window.document.activeElement.scrollTop = 0;
            }
            this.navbar.sidebarClose();

          
        });
    }

}
