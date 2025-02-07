import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Import HttpHeaders
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

export class DashboardComponent implements OnInit {
  users: any[] = []; // Declare an array to store user data

  showError : string | null = null;

  constructor(private http: HttpClient, private router: Router) { } // Inject HttpClient and Router

  ngOnInit(): void {
    const token = localStorage.getItem('access_token'); // Extract token from localStorage

    this.showError = "";

    if (!token) {
      console.error('Access token not found. Redirecting to login.');
      this.router.navigate(['/login']); // Redirect to login if token is missing
      return;
    }

    // Set headers with the access token
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Fetch user data with the access token
    this.http.get<any[]>('http://localhost:3000/auth/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }).subscribe({
      next: (users: any[]) => {
        this.users = users;
        console.log(users);
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
        // Optional: Handle unauthorized access

        // this.router.navigate(['/login']);
        this.showError = "Error fetching user data";
      },
    });
  }

  logout(): void {
    // Remove access_token from sessionStorage
    localStorage.removeItem('access_token');
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}