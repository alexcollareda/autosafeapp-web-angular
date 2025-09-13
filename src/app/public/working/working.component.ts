import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Rellax from 'rellax';

@Component({
  selector: 'app-working',
  templateUrl: './working.component.html',
  styleUrls: ['./working.component.scss']
})
export class WorkingComponent implements OnInit, OnDestroy {

  constructor() { }

 ngOnInit() {

        var navbar = document.getElementsByTagName('nav')[0];
        navbar.classList.remove('navbar-transparent');
        var body = document.getElementsByTagName('body')[0];
        body.classList.remove('index-page');
    }
    ngOnDestroy() {
    }

}
