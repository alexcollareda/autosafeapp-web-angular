import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { PublicModule } from './public/public.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { LoggedInLayoutComponent } from './layouts/logged-in-layout/logged-in-layout.component';
import { NavbarLoggedComponent } from './shared/navbar-logged/navbar-logged.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MyServicesComponent } from './my-services/my-services.component';
import { NewServicesComponent } from './new-services/new-services.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { NewPromotionsComponent } from './new-promotions/new-promotions.component';
import { MyPromotionsComponent } from './my-promotions/my-promotions.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarComponent } from './calendar/calendar.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        DashboardComponent,
        PublicLayoutComponent,
        LoggedInLayoutComponent,
        NavbarLoggedComponent,
        MyServicesComponent,
        NewServicesComponent,
        MyCompanyComponent,
        NewPromotionsComponent,
        MyPromotionsComponent,
        CalendarComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        NgbModule,
        FormsModule,
        RouterModule,
        AppRoutingModule,
        ComponentsModule,
        PublicModule,
        HttpClientModule,
        JwBootstrapSwitchNg2Module,
        NgxMaskModule.forRoot(),
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        }),
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useValue: 'pt-BR'
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
