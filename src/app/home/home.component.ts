import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import {AsyncPipe} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {default as _rollupMoment} from 'moment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {OnInit} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {AuthService} from '../auth.service';
import { ToastrService } from 'ngx-toastr'; 
import { AppConstants } from '../common/appconstants';
import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';


declare var google: any; 

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})

export class HomeComponent implements OnInit {
  googleURL = AppConstants.GOOGLE_AUTH_URL;
  loginForm : FormGroup;
  apiUrl: any = "http://localhost:8080/jewelbankersapi";
  dataSource: any;
  constructor(private fb: FormBuilder, private router: Router,private http:HttpClient,
    private authService: AuthService,  private toastr: ToastrService) {
    this.loginForm= new FormGroup({
      username: new FormControl("",[Validators.required,Validators.maxLength(21)]),
      password: new FormControl("",[Validators.required,Validators.maxLength(21)])
    })
  }

  login(form:any) {
    this.authService.signIn(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      response => {
        console.log('Login successful', response);
        this.toastr.success("Login successful", "success", { positionClass: 'toast-top-left' });
        console.log(response.roles);
        
        console.log(response.roles.filter((item: string) => item == "ROLE_ADMIN")>0);
        console.log(response.roles.filter((item: string) => item == "ROLE_USER"));
        
        if(response.roles.filter((item: string) => item == "ROLE_ADMIN").length>0){
          this.router.navigate(['/home']);
          // sessionStorage.setItem('userloggedin','true')
        }else if(response.roles.filter((item: string) => item == "ROLE_USER").length>0){
          this.router.navigate(['/addcustomer']);
          // sessionStorage.setItem('userloggedin','true')
        }
      },
      error => {
        console.error('Login failed', error);
        this.toastr.success(error?.error?.message || 'Error', "danger", { positionClass: 'toast-top-left' });
      }
    );
  }

  decodeJWTToken(token: string){
    return JSON.parse(atob(token.split(".")[1]))
  }
  handleOauthResponse(response: { credential: any; }){
    console.log(response);
    
    const responsePayload = this.decodeJWTToken(response.credential)
    console.log(responsePayload)
    sessionStorage.setItem('loggedinUser',JSON.stringify(responsePayload))
    // window.location('/your-desired-place') 
    //Changed the above URL where you want user to be redirected
  }

  initGoogleSignIn() {
    if(google){
      google.accounts.id.initialize({
        client_id: "652919857197-t0gtmj7oqs7qrje4nfecln53he2d2spd.apps.googleusercontent.com",
        callback: this.handleGoogleSignInResponse.bind(this)
      });
      google.accounts.id.renderButton(document.getElementById('google-signin-button'), {
        theme: 'outline',
        size: 'large'
      });
    }
  }

  handleGoogleSignInResponse(response: any) {
    if (response.error) {
      console.error('Google Sign-In error:', response.error);
      // Handle error
    } else {
      const idToken = response.credential;
      console.log("idToken"+idToken);
      // Send idToken to backend for validation and JWT generation
      this.sendTokenToBackend(idToken);
    }
  }

  sendTokenToBackend(idToken: string) {
    // Send idToken to backend for validation and JWT generation
    this.http.post<any>(`${this.apiUrl}/social/loginSuccess`, { credential: idToken })
      .subscribe(
        response => {
          if (response && response.token) {
            this.saveToken(response.token);
            this.router.navigate(['/login']); // Navigate to dashboard or any secured route
          } else {
            console.error('Failed to receive token');
            // Handle error
          }
        },
        error => {
          console.error('Error processing login:', error);
          // Handle error
        }
      );
  }

  saveToken(token: string) {
    sessionStorage.setItem('accessToken', token); // Save token in cookie for 7 days (adjust as needed)
  }

  ngOnInit(){
    this.initGoogleSignIn();

    if(this.authService.getUserData().accessToken && this.authService.getUserData().roles?.includes('ROLE_ADMIN')){
      this.router.navigate(['/login'])
    }
    // this.fetch();
    // this.fetch();
  }

  onSubmit(form:any) {
    if (this.loginForm.valid) {
    console.log('Form submitted')
    console.log(this.loginForm.value);
    // this.router.navigate(['/login'])
    }
  }
  public  fetch(){
    this.http.get('http://localhost:8080/jewelbankersapi/users').subscribe(
      (resp:any)=>{
        console.log(resp);
        // this.preciousMetals$ = resp;
      }
    )
  }

  signInWithGoogle(): void {
  }

  isLoggedIn(){
    return this.authService.isLogin()
  }
}



