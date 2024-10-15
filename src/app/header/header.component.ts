import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
constructor(private authService:AuthService){

}
ngOnInit() {
  console.log("header"+this.isLoggedIn());
  this.isLoggedIn();
}

user = { isLoggedIn: false };

logIn() {
  this.user.isLoggedIn = true;
}

logOut() {
  this.user.isLoggedIn = this.isLoggedIn();
}

isLoggedIn(){
  return this.authService.isLogin()
}
}
