import { TestBed, UnitReference, Mocked } from '@suites/unit';
import {
  Logger,
  DatabaseService,
  UserApiService,
  UserDal,
  UserService,
} from './e2e-assets-sociable';

describe('Suites Jest / NestJS E2E Test Ctor', () => {
  let unit: UserService;
  let unitRef: UnitReference;

  beforeAll(async () => {
    const { unitRef: ref, unit: underTest } = await TestBed.sociable(UserService)
      .expose(UserApiService)
      .expose(UserDal)
      .expose(DatabaseService)
      .mock(Logger)
      .using({ log: jest.fn().mockReturnValue('overridden') })
      .compile();

    unitRef = ref;
    unit = underTest;
  });

  describe('when compiling the builder and turning into testing unit', () => {
    test('then the unit should an instance of the class under test', () => {
      expect(unit).toBeInstanceOf(UserService);
    });
  });
});
