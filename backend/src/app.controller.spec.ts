import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  // Mocking AppService
  const mockAppService = {
    getHello: jest.fn().mockReturnValue('Hello World'), // Mock the getHello method to return 'Hello World'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService, // Providing the mockAppService
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World"', () => {
      // Act: call the getHello method
      const result = appController.getHello();

      // Assert: validate the result returned by getHello
      expect(result).toBe('Hello World');
      expect(appService.getHello).toHaveBeenCalled(); // Ensure the AppService getHello method was called
    });
  });
});
