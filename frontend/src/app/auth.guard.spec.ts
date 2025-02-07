import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access if access_token is present', () => {
    // Arrange: Set a token in localStorage
    localStorage.setItem('access_token', 'dummy_token');

    // Act: Call canActivate with mock route and state
    const result = guard.canActivate({} as any, {} as any);

    // Assert: The result should be true (access allowed)
    expect(result).toBeTrue();
  });

  it('should redirect to login if access_token is not present', () => {
    // Arrange: Ensure no token is in localStorage
    localStorage.removeItem('access_token');

    // Spy on the router's navigate method to verify redirection
    const navigateSpy = spyOn(router, 'navigate');

    // Act: Call canActivate with mock route and state
    const result = guard.canActivate({} as any, {} as any);

    // Assert: The result should be false (access denied)
    expect(result).toBeFalse();

    // Assert: Router should navigate to '/login'
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
