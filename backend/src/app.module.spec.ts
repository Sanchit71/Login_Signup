import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

describe('AppModule', () => {
  let app: TestingModule;
  let appController: AppController;
  let appService: AppService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        AppModule, // Import the entire module
      ],
    })
      .overrideProvider(getRepositoryToken(User)) // Mock the UserRepository
      .useValue({
        // Mock any necessary methods for UserRepository
        findOne: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  it('should have AppModule defined', () => {
    expect(app).toBeDefined();
  });

  it('should call AppService method correctly', () => {
    const result = 'Hello World!';
    jest.spyOn(appService, 'getHello').mockReturnValue(result);
    expect(appController.getHello()).toBe(result);
  });

  it('should load the AuthModule correctly', () => {
    const authModule = app.get<AuthModule>(AuthModule);
    expect(authModule).toBeDefined();
  });

  // Add more tests to check for specific configurations or behavior
});
