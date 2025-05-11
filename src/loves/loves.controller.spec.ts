import { Test, TestingModule } from '@nestjs/testing';
import { LovesController } from './loves.controller';
import { LovesService } from './loves.service';

describe('LovesController', () => {
  let controller: LovesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LovesController],
      providers: [LovesService],
    }).compile();

    controller = module.get<LovesController>(LovesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
