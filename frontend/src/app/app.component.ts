import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { RouterLink, RouterLinkActive } from '../../node_modules/@angular/router/index';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';

    constructor(private router: Router) { } 

  logout(): void {
    // Remove access_token from sessionStorage
    localStorage.removeItem('access_token');
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}
