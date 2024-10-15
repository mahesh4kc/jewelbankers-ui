import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css' 
})

export class AppComponent {
  title = 'jewel';

  constructor(private authService:AuthService){

  }
  
  isLoggedIn(){
    return this.authService.isLogin()
  }
}

