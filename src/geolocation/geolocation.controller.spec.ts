import { Test, TestingModule } from '@nestjs/testing';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';

describe('GeolocationController', () => {
  let controller: GeolocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeolocationController],
      providers: [GeolocationService],
    }).compile();

    controller = module.get<GeolocationController>(GeolocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
