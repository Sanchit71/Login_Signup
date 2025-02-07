import { ComponentFixture, TestBed, fakeAsync,tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [ReactiveFormsModule, NgIf, HttpClientTestingModule, RouterTestingModule.
        withRoutes([
          { path: 'dashboard', component: class { } },  // mock route for '/dashboard'
        ])],
      providers: [HttpClient, Router],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpClient);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.controls['firstName'].value).toBe('');
    expect(component.userForm.controls['lastName'].value).toBe('');
    expect(component.userForm.controls['email'].value).toBe('');
    expect(component.userForm.controls['password'].value).toBe('');
    expect(component.userForm.controls['confirmPassword'].value).toBe('');
    expect(component.userForm.controls['mobile'].value).toBe('');
  });

  it('should validate the email domain using docquityEmailValidator', () => {
    const emailControl = component.userForm.controls['email'];
    emailControl.setValue('test@docquity.com');
    expect(emailControl.errors).toBeNull();

    emailControl.setValue('test@gmail.com');
    expect(emailControl.errors).toEqual({ invalidEmailDomain: true });
  });

  it('should validate password match', () => {
    const passwordControl = component.userForm.controls['password'];
    const confirmPasswordControl = component.userForm.controls['confirmPassword'];

    passwordControl.setValue('Password123!');
    confirmPasswordControl.setValue('Password123!');
    expect(component.userForm.errors).toBeNull();

    confirmPasswordControl.setValue('DifferentPassword!');
    expect(component.userForm.errors).toEqual({ passwordsMismatch: true });
  });


  it('should submit the form successfully when valid', () => {
    component.userForm.controls['firstName'].setValue('John');
    component.userForm.controls['lastName'].setValue('Doe');
    component.userForm.controls['email'].setValue('john@docquity.com');
    component.userForm.controls['password'].setValue('Password123!');
    component.userForm.controls['confirmPassword'].setValue('Password123!');
    component.userForm.controls['mobile'].setValue('1234567890');

    const formData = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@docquity.com',
      password: 'Password123!',
      mobile_number: '1234567890'
    };

    const signupSpy = spyOn(component, 'onUserSave').and.callThrough();
    component.onUserSave();

    // Mock the HTTP response for successful signup
    const req = httpMock.expectOne('http://localhost:3000/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Signup successful' });

    // Expect the method to be called
    expect(signupSpy).toHaveBeenCalled();
    // expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle email already exists error on signup', () => {
    component.userForm.controls['firstName'].setValue('John');
    component.userForm.controls['lastName'].setValue('Doe');
    component.userForm.controls['email'].setValue('john@docquity.com');
    component.userForm.controls['password'].setValue('Password123!');
    component.userForm.controls['confirmPassword'].setValue('Password123!');
    component.userForm.controls['mobile'].setValue('1234567890');

    component.onUserSave();

    const req = httpMock.expectOne('http://localhost:3000/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush({ field: 'email' }, { status: 409, statusText: 'Conflict' });

    // Expect the email error to be set
    expect(component.emailError).toBe('Email ID already exists.');
  });

  it('should handle generic error on signup', () => {
    component.userForm.controls['firstName'].setValue('John');
    component.userForm.controls['lastName'].setValue('Doe');
    component.userForm.controls['email'].setValue('john@docquity.com');
    component.userForm.controls['password'].setValue('Password123!');
    component.userForm.controls['confirmPassword'].setValue('Password123!');
    component.userForm.controls['mobile'].setValue('1234567890');

    component.onUserSave();

    const req = httpMock.expectOne('http://localhost:3000/auth/signup');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

    // Expect a generic error message to be set
    expect(component.emailError).toBe('An error occurred during signup. Please try again.');
  });

  it('should handle invalid form submission', () => {
    component.userForm.controls['firstName'].setValue('');
    component.userForm.controls['lastName'].setValue('');
    component.userForm.controls['email'].setValue('');
    component.userForm.controls['password'].setValue('');
    component.userForm.controls['confirmPassword'].setValue('');
    component.userForm.controls['mobile'].setValue('');

    component.onUserSave();

    expect(component.emailError).toBe('Please fill in all required fields correctly.');
  });

  // it('should remove token and navigate to signup if token verification fails', () => {

  //   const spyget = spyOn(router, 'navigate');

  //   localStorage.setItem('access_token', 'invalid-token');

  //   // Mock the HTTP error response for token verification failure
  //   const tokenVerificationRequest = httpMock.expectOne('http://localhost:3000/auth/verify-token');
  //   expect(tokenVerificationRequest.request.method).toBe('GET');

  //   // Simulating a JWT verification error with an appropriate error message
  //   const errorMessage = 'JWT verification failed: Invalid token'; // Modify this to simulate your backend error
  //   tokenVerificationRequest.flush(
  //     { message: errorMessage }, // Error message you want to simulate
  //     { status: 401, statusText: 'Unauthorized' }
  //   );

  //   // Simulate passage of time for async HTTP call
  //   // tick();

  //   // Expect the token to be removed from localStorage
  //   expect(localStorage.getItem('access_token')).toBeNull();

  //   // Expect the router to navigate to '/signup'
  //   expect(spyget).toHaveBeenCalledWith(['/signup']);
  // });

  // it('should verify token if exists, and redirect to dashboard', fakeAsync(() => {
  //   // httpMock.verify();
  //   const spyget = spyOn(router, 'navigate');
  //   localStorage.setItem('access_token', 'test-token');

  //   component.ngOnInit();
    
  //   const mockResponse = true;

  //   const tokenVerificationRequest = httpMock.expectOne('http://localhost:3000/auth/verify-token');
  //   expect(tokenVerificationRequest.request.method).toBe('GET');


  //   tokenVerificationRequest.flush({mockResponse});
  //   // tick();
  //   expect(spyget).toHaveBeenCalledWith(['/dashboard']);

  //   httpMock.verify();
  // }));
});
