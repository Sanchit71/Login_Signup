import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [ReactiveFormsModule, NgIf, HttpClientTestingModule, RouterTestingModule.withRoutes([
        { path: 'dashboard', component: class { } },
        { path: 'login', component: class { } }  // mock route for '/dashboard'
      ])],
      providers: [HttpClient, Router],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if no token is found', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue(null);  // Simulate no token in localStorage
    spyOn(router, 'navigate'); // Spy on the navigate method

    component.ngOnInit();
    tick();  // Simulate asynchronous passage of time

    expect(router.navigate).toHaveBeenCalledWith(['/login']);  // Check if redirect happened
  }));

  it('should fetch user data if token exists', fakeAsync(() => {
    const mockToken = 'test-token';
    const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
    spyOn(localStorage, 'getItem').and.returnValue(mockToken);  // Simulate token in localStorage

    const spyHttp = spyOn(component['http'], 'get').and.returnValue(of(mockUsers)); // Mock the HTTP request

    component.ngOnInit();
    tick();  // Simulate asynchronous passage of time

    expect(spyHttp).toHaveBeenCalledWith('http://localhost:3000/auth/dashboard', {
      headers: { Authorization: `Bearer ${mockToken}` },
    });

    expect(component.users).toEqual(mockUsers); // Check if the component's users array is populated correctly
  }));

  it('should handle error and redirect to login if fetching user data fails', fakeAsync(() => {
    const mockToken = 'test-token';
    spyOn(localStorage, 'getItem').and.returnValue(mockToken); // Simulate token in localStorage

    const errorResponse = 'Error fetching user data';
    spyOn(component['http'], 'get').and.returnValue(throwError(() => new Error(errorResponse))); // Mock HTTP error

    spyOn(router, 'navigate');  // Spy on the navigate method

    component.ngOnInit();
    tick();  // Simulate asynchronous passage of time

    expect(router.navigate).toHaveBeenCalledWith(['/login']); // Check if redirect happened due to error
  }));

  it('should log out and redirect to login on logout', fakeAsync(() => {
    spyOn(localStorage, 'removeItem'); // Spy on removeItem to check if it's called
    spyOn(router, 'navigate'); // Spy on navigate to check if redirection happens

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');  // Check if token is removed
    expect(router.navigate).toHaveBeenCalledWith(['/login']);  // Check if redirect to login happened
  }));
});