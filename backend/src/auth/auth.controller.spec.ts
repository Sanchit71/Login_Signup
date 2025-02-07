import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth/auth.guard';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  // Mocking AuthService
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    dashboard: jest.fn(),
    verifyToken: jest.fn(),
  };

  // Mocking JwtService
  const mockJwtService = {
    sign: jest.fn(),
  };

  // Mocking AuthGuard
  const mockAuthGuard = {
    canActivate: jest.fn().mockImplementation(() => true), // Always return true to bypass auth guard in tests
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Provide the mockJwtService here
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard, // Provide the mockAuthGuard here
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService); // Get JwtService from the module
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup and return response', async () => {
      const signupDto: SignupDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        mobile_number: '1234567890',
        password: 'Password123',
      };

      mockAuthService.signup.mockResolvedValue({
        message: 'User Registered Successfully',
      });

      const result = await authController.signup(signupDto);

      expect(result).toEqual({ message: 'User Registered Successfully' });
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return access token', async () => {
      const loginDto: LoginDto = {
        email: 'john.doe@example.com',
        password: 'Password123',
      };

      mockAuthService.login.mockResolvedValue({
        message: 'User Logged In Successfully',
        access_token: 'mocked.jwt.token',
      });

      const result = await authController.login(loginDto);

      expect(result).toEqual({
        message: 'User Logged In Successfully',
        access_token: 'mocked.jwt.token',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('dashboard', () => {
    it('should call authService.dashboard and return user data', async () => {
      const mockUserData = [
        { firstname: 'John', lastname: 'Doe', mobile_number: '1234567890' },
        { firstname: 'Jane', lastname: 'Doe', mobile_number: '0987654321' },
      ];

      mockAuthService.dashboard.mockResolvedValue(mockUserData);

      const result = await authController.dashboard();

      expect(result).toEqual(mockUserData);
      expect(mockAuthService.dashboard).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should call authService.verifyToken and return true', async () => {
      mockAuthService.verifyToken.mockResolvedValue(true);

      const result = await authController.verifyToken();

      expect(result).toBe(true);
      expect(mockAuthService.verifyToken).toHaveBeenCalled();
    });
  });
});
