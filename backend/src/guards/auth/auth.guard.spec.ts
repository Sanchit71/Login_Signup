import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard'; // Import the AuthGuard
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { UnauthorizedException } from '@nestjs/common'; // Import UnauthorizedException
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockRequest = () => ({
    headers: {
      authorization: 'Bearer validToken',
    },
  });

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest(),
    }),
  } as unknown as ExecutionContext;

  // Before all tests, mock console methods to suppress log output
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // After all tests, restore console methods
  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no token is provided', async () => {
      const requestWithoutToken = {
        headers: {},
      };

      const contextWithoutToken = {
        switchToHttp: () => ({
          getRequest: () => requestWithoutToken,
        }),
      } as unknown as ExecutionContext;

      await expect(
        authGuard.canActivate(contextWithoutToken),
      ).rejects.toThrowError(new UnauthorizedException('No token provided'));
    });

    it('should verify the token successfully when valid token is provided', async () => {
      const token = 'validToken';
      const payload = { userId: 1, email: 'user@example.com' };
      mockJwtService.verifyAsync.mockResolvedValue(payload); // Simulate successful token verification

      const result = await authGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: expect.any(String),
      });
    });

    it('should throw UnauthorizedException if the token is invalid', async () => {
      const invalidToken = 'invalidToken';
      const error = new Error('Invalid token');
      mockJwtService.verifyAsync.mockRejectedValue(error); // Simulate token verification failure

      await expect(
        authGuard.canActivate(mockExecutionContext),
      ).rejects.toThrowError(new UnauthorizedException('Invalid token'));
    });

    it('should throw UnauthorizedException if the token is expired', async () => {
      const expiredToken = 'expiredToken';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError'; // Simulate token expired error
      mockJwtService.verifyAsync.mockRejectedValue(error);

      await expect(
        authGuard.canActivate(mockExecutionContext),
      ).rejects.toThrowError(new UnauthorizedException('Token has expired'));
    });
  });
});
