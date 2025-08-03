import { Test, TestingModule } from '@nestjs/testing';
import { BannedService } from './banned.service';

describe('BannedService', () => {
  let service: BannedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannedService],
    }).compile();

    service = module.get<BannedService>(BannedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
