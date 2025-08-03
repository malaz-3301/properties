import { Test, TestingModule } from '@nestjs/testing';
import { BannedController } from './banned.controller';
import { BannedService } from './banned.service';

describe('BannedController', () => {
  let controller: BannedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannedController],
      providers: [BannedService],
    }).compile();

    controller = module.get<BannedController>(BannedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
