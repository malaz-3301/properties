import { Test, TestingModule } from '@nestjs/testing';
import { LovesService } from './loves.service';

describe('LovesService', () => {
  let service: LovesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LovesService],
    }).compile();

    service = module.get<LovesService>(LovesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
