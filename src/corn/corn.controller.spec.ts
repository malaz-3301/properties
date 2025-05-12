import { Test, TestingModule } from '@nestjs/testing';
import { CornController } from './corn.controller';
import { CornService } from './corn.service';

describe('CornController', () => {
  let controller: CornController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CornController],
      providers: [CornService],
    }).compile();

    controller = module.get<CornController>(CornController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
