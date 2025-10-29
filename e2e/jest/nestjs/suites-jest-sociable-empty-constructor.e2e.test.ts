import { TestBed } from '@suites/unit';
import {
  TestService,
  TestSociableService,
  TestDependService,
} from './suites-jest-sociable-empty-constructor-assets';

describe('Suites Jest / NestJS E2E Test Ctor - Empty Constructor', () => {
  it('should expose sociable service', async () => {
    const { unit, unitRef } = await TestBed.sociable(TestService)
      .expose(TestSociableService)
      .disableFailFast() // v3.x behavior - TestDependService auto-mocked
      .compile();

    const testDependService = unitRef.get(TestDependService);

    unit.test();
    expect(testDependService.call).toHaveBeenCalledWith(true);
  });
});
