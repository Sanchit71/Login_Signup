import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  // Define the test user payload
  const testUser = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import the HttpClientTestingModule for mocking HTTP requests
      providers: [AuthService] // Provide the AuthService for testing
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController); // Inject the mock HTTP controller
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call signup and return data from the API', () => {
    // Arrange: Define the expected API response
    const mockResponse = { message: 'User created successfully' };

    // Act: Call the signup method
    service.signup(testUser).subscribe(response => {
      // Assert: Check if the response matches the mock response
      expect(response).toEqual(mockResponse);
    });

    // Assert: Verify the HTTP request is made with the correct URL and payload
    const req = httpMock.expectOne('http://localhost:3000/auth/signup');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testUser);

    // Respond with mock data
    req.flush(mockResponse);
  });

  it('should handle an error when signup fails', () => {
    // Arrange: Define an error response
    const errorResponse = { status: 400, statusText: 'Bad Request' };

    // Act: Call the signup method
    service.signup(testUser).subscribe(
      () => fail('expected an error, not data'),
      (error) => {
        // Assert: Ensure the error is handled correctly
        expect(error.status).toBe(400);
        expect(error.statusText).toBe('Bad Request');
      }
    );

    // Assert: Verify the HTTP request is made with the correct URL and payload
    const req = httpMock.expectOne('http://localhost:3000/auth/signup');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testUser);

    // Respond with an error
    req.flush('', errorResponse);
  });

  afterEach(() => {
    // Ensure that there are no outstanding HTTP requests
    httpMock.verify();
  });
});
