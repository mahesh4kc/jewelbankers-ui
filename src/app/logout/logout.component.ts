import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [MatButtonModule, HeaderComponent, FooterComponent],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {

  constructor(private authService:AuthService,private router:Router){

  }
  logout(){
    this.authService.logout();
    
    this.router.navigate(['/']);
  }
}
