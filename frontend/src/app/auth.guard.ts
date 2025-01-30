import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if the token exists in sessionStorage
    const token = localStorage.getItem('access_token');

    if (token) {
      // Token exists, allow access
      return true;
    } else {
      // Token does not exist, redirect to login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
