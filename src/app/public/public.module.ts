import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { PublicComponent } from './public.component';
import { RegisterComponent } from './register/register.component';
import { NgxMaskModule } from 'ngx-mask';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkingComponent } from './working/working.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbModule,
        NouisliderModule,
        JwBootstrapSwitchNg2Module,
        RouterModule,
        HttpClientModule,
        NgxMaskModule.forRoot()
    ],
    declarations: [
        LandingComponent,
        LoginComponent,
        PublicComponent,
        ProfileComponent,
        RegisterComponent,
        RecoverPasswordComponent,
        WorkingComponent,
        CompanyProfileComponent
    ]
})
export class PublicModule { }
