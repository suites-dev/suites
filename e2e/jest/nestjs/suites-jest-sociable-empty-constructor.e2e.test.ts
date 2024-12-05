import { TestBed } from "@suites/unit";
import { TestService, TestSociableService, TestDependService } from "./suites-jest-sociable-empty-constructor-assets";

describe('Test', () => {
  it('should expose sociable service', async () => {
    const { unit, unitRef } = await TestBed.sociable(TestService).expose(TestSociableService).compile();

    const testDependService = unitRef.get(TestDependService);

    unit.test();
    expect(testDependService.call).toHaveBeenCalledWith(true);
  });
});