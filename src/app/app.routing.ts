import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

import { ComponentsComponent } from './components/components.component';
import { LandingComponent } from './public/landing/landing.component';
import { LoginComponent } from './public/login/login.component';
import { ProfileComponent } from './public/profile/profile.component';
import { RegisterComponent } from './public/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LoggedInLayoutComponent } from './layouts/logged-in-layout/logged-in-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { MyServicesComponent } from './my-services/my-services.component';
import { NewServicesComponent } from './new-services/new-services.component';
import { RecoverPasswordComponent } from './public/recover-password/recover-password.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { NewPromotionsComponent } from './new-promotions/new-promotions.component';
import { MyPromotionsComponent } from './my-promotions/my-promotions.component';
import { WorkingComponent } from './public/working/working.component';
import { environment } from '../environments/environment';
import { CompanyProfileComponent } from './public/company-profile/company-profile.component';

var canregister = null;
if(environment){
  canregister = environment.canRegister
}
const routes: Routes = [
  // Rotas para a área pública (sem autenticação)
  {
    path: '', // Rota raiz (ou 'auth', 'public', etc.)
    component: PublicLayoutComponent, // Este é o layout que será renderizado
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'index', component: ComponentsComponent },
      { path: 'public/landing', component: LandingComponent },
      { path: 'public/login',  component: canregister ? LoginComponent : WorkingComponent },
      { path: 'public/profile', component: ProfileComponent },
      { path: 'public/register', component: canregister ? RegisterComponent : WorkingComponent},
      { path: 'public/recover-password', component: RecoverPasswordComponent },
      { path: 'public/company-profile', component: CompanyProfileComponent },
    ]
  },

  // Rotas para a área logada (com autenticação)
  {
    path: 'app',
    component: LoggedInLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'my-services', component: MyServicesComponent },
      { path: 'new-services', component: NewServicesComponent },
      { path: 'my-company', component: MyCompanyComponent },
      { path: 'my-promotions', component: MyPromotionsComponent, canActivate: [AuthGuard] },
      { path: 'new-promotions', component: NewPromotionsComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];

const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled', 
};


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, routerOptions)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
