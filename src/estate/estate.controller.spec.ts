import { Test, TestingModule } from '@nestjs/testing';
import { EstateController } from './estate.controller';
import { EstateService } from './estate.service';

describe('EstateController', () => {
  let controller: EstateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstateController],
      providers: [EstateService],
    }).compile();

    controller = module.get<EstateController>(EstateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
