import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm'; // Use getRepositoryToken instead of getCustomRepositoryToken
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import exp from 'constants';
import { find } from 'rxjs';

fdescribe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User), // Corrected here to use getRepositoryToken
          useValue: mockUserRepository, // Providing the mock for Repository
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Mocked JwtService
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User)); // Injecting Repository
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const signupDto = {
      firstname: 'Temp',
      lastname: 'User',
      email: 'temp@docquity.com',
      mobile_number: '1234567890',
      password: 'TempUser@123',
    };

    it('should register the user successfully', async () => {
      // Arrange: mock behaviors for repository methods
      mockUserRepository.findOne.mockResolvedValue(null); // No existing user with the email
      mockUserRepository.create.mockReturnValue({
        ...signupDto,
        password: 'hashedPassword',
      });
      mockUserRepository.save.mockResolvedValue({
        ...signupDto,
        password: 'hashedPassword',
      }); // Successfully saved

      // Spy on bcrypt.hash method to mock password hashing
      const bcryptHashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword');

      // Act: call the signup method
      const result = await service.signup(signupDto);

      // Assert: validate that the result matches expectations
      expect(result).toEqual({ message: 'User Registered Successfully' });
      expect(bcryptHashSpy).toHaveBeenCalledWith('TempUser@123', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...signupDto,
        password: 'hashedPassword', // Ensure password is hashed
      });
    });

    it('should throw an error if the email already exists', async () => {
      // Arrange: simulate that the user with the provided email already exists
      mockUserRepository.findOne.mockResolvedValue({
        email: 'temp@docquity.com',
      });

      // Act and Assert: validate that an error is thrown
      await expect(service.signup(signupDto)).rejects.toThrowError(
        new ConflictException({
          field: 'email',
          message: 'Email already exists',
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'temp@docquity.com',
      password: 'TempUser@123',
    };

    it('should log in successfully if correct details are provided', async () => {
      // Arrange: simulate user data in the database
      const user = {
        id: 1,
        email: 'temp@docquity.com',
        password: 'hashedPassword', // The hashed password stored in the DB
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Spy on bcrypt.compare method to mock password comparison
      const bcryptCompareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(true);

      // Mock the JWT service
      mockJwtService.signAsync.mockReturnValue('mocked.jwt.token');

      // Act: call the login method
      const result = await service.login(loginDto);

      // Assert: validate the expected results
      expect(result).toEqual({
        message: 'User Logged In Successfully',
        access_token: 'mocked.jwt.token',
      });
      expect(bcryptCompareSpy).toHaveBeenCalledWith(
        'TempUser@123',
        'hashedPassword',
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });

    it('should throw an error if the email does not exist', async () => {
      // Arrange: simulate that the user does not exist
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act and Assert: validate that an error is thrown
      await expect(service.login(loginDto)).rejects.toThrowError(
        new BadRequestException({
          statusCode: 400,
          message: 'Email does not exist',
          error: 'Bad Request',
          field: 'email',
        }),
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      // Arrange: simulate user data in the database
      const user = {
        id: 1,
        email: 'temp@docquity.com',
        password: 'hashedPassword', // The hashed password stored in the DB
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Spy on bcrypt.compare method to mock password comparison
      const bcryptCompareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(false); // Password mismatch

      // Act and Assert: validate that an error is thrown
      await expect(service.login(loginDto)).rejects.toThrowError(
        new BadRequestException({
          statusCode: 400,
          message: 'Invalid password',
          error: 'Bad Request',
          field: 'password',
        }),
      );
    });
  });

  describe('dashboard', () => {
    it('should return a list of users without email and password', async () => {
      // Arrange: mock the response from userRepository.find
      const mockUsers = [
        { firstname: 'John', lastname: 'Doe', mobile_number: '1234567890' },
        { firstname: 'Jane', lastname: 'Doe', mobile_number: '0987654321' },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      // Act: call the dashboard method
      const result = await service.dashboard();

      // Assert: ensure the returned users do not have email or password
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['firstname', 'lastname', 'mobile_number'],
      });
    });
  });

  describe('verifyToken', () => {
    it('should return true', async () => {
      // Act: call the verifyToken method
      const result = await service.verifyToken();

      // Assert: verify that the result is true
      expect(result).toBe(true);
    });
  });
});
