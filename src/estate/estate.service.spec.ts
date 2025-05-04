import { Test, TestingModule } from '@nestjs/testing';
import { EstateService } from './estate.service';

describe('EstateService', () => {
  let service: EstateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstateService],
    }).compile();

    service = module.get<EstateService>(EstateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
