import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('AuthModule', () => {
  let authService: AuthService;
  let authController: AuthController;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule], // Import the module we want to test
    })
      .overrideProvider(getRepositoryToken(User)) // Mock the UserRepository
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
        // Add any other methods you use in the AuthService if needed
      })
      .compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User)); // Inject the mock repository
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(authController).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('should have JwtService correctly configured', () => {
    expect(jwtService).toHaveProperty('sign');
    expect(jwtService).toHaveProperty('verify');
  });

  // You can add other specific tests here, like testing controller methods or service methods
});
