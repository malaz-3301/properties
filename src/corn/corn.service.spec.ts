import { Test, TestingModule } from '@nestjs/testing';
import { CornService } from './corn.service';

describe('CornService', () => {
  let service: CornService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CornService],
    }).compile();

    service = module.get<CornService>(CornService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
