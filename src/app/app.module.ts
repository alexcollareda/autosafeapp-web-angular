import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { ExamplesModule } from './examples/examples.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxMaskModule } from 'ngx-mask';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { LoggedInLayoutComponent } from './layouts/logged-in-layout/logged-in-layout.component';
import { NavbarLoggedComponent } from './shared/navbar-logged/navbar-logged.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MyServicesComponent } from './my-services/my-services.component';
import { NewServicesComponent } from './new-services/new-services.component';
import { MyCompanyComponent } from './my-company/my-company.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';




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
        MyCompanyComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        NgbModule,
        FormsModule,
        RouterModule,
        AppRoutingModule,
        ComponentsModule,
        ExamplesModule,
        HttpClientModule,
        JwBootstrapSwitchNg2Module,
        NgxMaskModule.forRoot()
    ],
    providers: [
       {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Importante! Indica que pode haver múltiplos interceptors
    }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
