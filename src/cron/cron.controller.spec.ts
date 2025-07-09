import { Test, TestingModule } from '@nestjs/testing';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';

describe('CronController', () => {
  let controller: CronController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronController],
      providers: [CronService],
    }).compile();

    controller = module.get<CronController>(CronController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
