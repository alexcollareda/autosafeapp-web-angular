import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { ComponentsComponent } from './components/components.component';
import { LandingComponent } from './examples/landing/landing.component';
import { LoginComponent } from './examples/login/login.component';
import { ProfileComponent } from './examples/profile/profile.component';
import { NucleoiconsComponent } from './components/nucleoicons/nucleoicons.component';
import { RegisterComponent } from './examples/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { LoggedInLayoutComponent } from './layouts/logged-in-layout/logged-in-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { RecoverPasswordComponent } from './examples/recover-password/recover-password.component';

const routes: Routes = [
  // Rotas para a área pública (sem autenticação)
  {
    path: '', // Rota raiz (ou 'auth', 'public', etc.)
    component: PublicLayoutComponent, // Este é o layout que será renderizado
    children: [
        { path: '', redirectTo: 'index', pathMatch: 'full' },
        { path: 'index',                component: ComponentsComponent },
        { path: 'nucleoicons',          component: NucleoiconsComponent },
        { path: 'examples/landing',     component: LandingComponent },
        { path: 'examples/login',       component: LoginComponent },
        { path: 'examples/profile',     component: ProfileComponent },
        { path: 'examples/register',    component: RegisterComponent },
        { path: 'examples/recover-password',    component: RecoverPasswordComponent },
    ]
  },

  // Rotas para a área logada (com autenticação)
  {
    path: 'app', 
    component: LoggedInLayoutComponent, 
    canActivate: [AuthGuard],
    children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: DashboardComponent}
    ]
  },

  { path: '**', redirectTo: 'login' }
];


@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        RouterModule.forRoot(routes)
    ],
    exports: [
    ],
})
export class AppRoutingModule { }
