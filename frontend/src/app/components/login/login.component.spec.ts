import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have form invalid when email or password is empty', () => {
    const form = component.loginForm;
    form.controls['email'].setValue('');
    form.controls['password'].setValue('');
    expect(form.invalid).toBeTrue();
  });

  it('should call onLogin and handle success', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    component.loginForm.setValue(loginData);

    // Simulate success response from backend
    const response = { access_token: 'fake-token' };
    spyOn(router, 'navigate');

    component.onLogin();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(localStorage.getItem('access_token')).toBe('fake-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle error on login with invalid password', () => {
    const loginData = { email: 'test@example.com', password: 'wrongpassword' };
    component.loginForm.setValue(loginData);

    const errorResponse = { status: 400, error: { field: 'password', message: 'Invalid password' } };
    component.onLogin();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    req.flush(errorResponse.error, { status: 400, statusText: 'Bad Request' });

    expect(component.passwordError).toBe('Invalid password');
  });

  it('should handle error on login with invalid email', () => {
    const loginData = { email: 'test@example.com', password: 'wrongpassword' };
    component.loginForm.setValue(loginData);

    const errorResponse = { status: 400, error: { field: 'email', message: 'Email does not exist' } };
    component.onLogin();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    req.flush(errorResponse.error, { status: 400, statusText: 'Bad Request' });

    expect(component.emailError).toBe('Email does not exist');
  });

  it('should handle error on login with other errors', () => {
    const loginData = { email: 'test@example.com', password: 'wrongpassword' };
    component.loginForm.setValue(loginData);

    // const errorResponse = { status: 400, error: { message: 'An unexpected error occurred. Please try again later.' } };
    component.onLogin();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    // req.flush(errorResponse.error, { status: 400, statusText: 'Bad Request' });

    // expect(component.emailError).toBe('An unexpected error occurred. Please try again later.');
    req.error(new ErrorEvent('NetworkError', { message: 'An unexpected error occurred. Please try again later.' }));

    // Assert that the component handled the error
    expect(component.emailError).toBe('An unexpected error occurred. Please try again later.');
  });

  it('should verify token in ngOnInit if token exists', fakeAsync(() => {

    spyOn(localStorage, 'getItem').and.returnValue('test-token');
    const spyHttp = spyOn(http, 'get').and.returnValue(of({})); // Mock successful response

    component.ngOnInit();
    tick();
    const headers = new HttpHeaders().set('Authorization', `Bearer test-token`);
    // let token=localStorage.getItem('token');

    expect(spyHttp).toHaveBeenCalledWith('http://localhost:3000/auth/verify-token', { headers });

    expect(router.navigate(['/dashboard']));
  }));

  it('should remove token and redirect to login if token verification fails', fakeAsync(() => {

    const spyHttp = spyOn(http, 'get').and.returnValue(throwError({ status: 401 }));
    const removeItemSpy = spyOn(localStorage, 'removeItem');

    component.ngOnInit();
    tick();

    expect(spyHttp).toHaveBeenCalled();
    expect(removeItemSpy).toHaveBeenCalledWith('access_token');
    expect(router.navigate(['/login']));
  }));

  it('should log form is invalid', () => {

    const consolespyon = spyOn(console, "log");

    component.onLogin();
    expect(consolespyon).toHaveBeenCalledOnceWith('Form is invalid');
  });

});