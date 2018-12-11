import { Test, TestingModule } from '@nestjs/testing';
import { ChartsGateway } from './charts.gateway';

describe('ChartsGateway', () => {
  let gateway: ChartsGateway;
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartsGateway],
    }).compile();
    gateway = module.get<ChartsGateway>(ChartsGateway);
  });
  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
