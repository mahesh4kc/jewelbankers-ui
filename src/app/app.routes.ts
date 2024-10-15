import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PledgeComponent } from './pledge/pledge.component';
import { RedeemComponent } from './redeem/redeem.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddCustomerComponent } from './add-customer/add-customer.component';
import { SettingsComponent } from './setting/setting.component';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {AsyncPipe} from '@angular/common';
import { FormsModule,FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { AddUserDialogComponent } from './admin-dashboard/add-user-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LogoutComponent } from './logout/logout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { SearchComponent } from './search/search.component';
import { UndoComponent } from './undo/undo.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),canActivate:[AuthGuard] },
    { path: 'logout', loadComponent: () => import('./logout/logout.component').then((c) => c.LogoutComponent),canActivate:[AuthGuard] },
    // { path: 'forget', loadComponent: () => import('./forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent) },
    { path: '',component:HomeComponent },
    { path: 'pledge', loadComponent: () => import('./pledge/pledge.component').then((c) => c.PledgeComponent),canActivate:[AuthGuard] },
    { path: 'redeem', loadComponent: () => import('./redeem/redeem.component').then((c) => c.RedeemComponent),canActivate:[AuthGuard] },
    { path: 'setting', loadComponent: () => import('./setting/setting.component').then((c) => c.SettingsComponent),canActivate:[AuthGuard] },
    { path: 'admin-dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent),canActivate:[AuthGuard] },
    { path: 'reset-password', loadComponent: () => import('./new-password/new-password.component').then((c) => c.NewPasswordComponent) },
    { path: 'search', loadComponent: () => import('./search/search.component').then((c) => c.SearchComponent),canActivate:[AuthGuard] },
    { path: 'undo', loadComponent: () => import('./undo/undo.component').then((c) => c.UndoComponent),canActivate:[AuthGuard] },
    {path:'forget',component:ForgotPasswordComponent},
    {path:'admin',component:AdminDashboardComponent,canActivate:[AuthGuard]}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        ToastrModule.forRoot(),
        MatCardModule,
        ReactiveFormsModule,
        MatListModule,
        CommonModule,
        AsyncPipe,
        AgGridModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule   
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [RouterModule],
    providers: [provideHttpClient(
        withInterceptorsFromDi(),
    ),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    },],
    declarations: [HomeComponent,AdminDashboardComponent,AddUserDialogComponent,ForgotPasswordComponent,NewPasswordComponent]
  })
  export class AppRoutingModule { 
  
  }