import { CatsService } from './cats.service';
import { DeepMockOf, MockOf, Spec } from '../src';
import { Logger } from '@nestjs/common';
import { RandomNameService } from './random-name.service';
import { CatsApiService, ExternalApiCatResponse } from './cats-api.service';

describe('Cats Service Unit Test', () => {
  let catsService: CatsService;
  let logger: DeepMockOf<Logger>;
  let catsApiService: DeepMockOf<CatsApiService>;
  let randomNameService: MockOf<RandomNameService>;

  const EXTERNAL_API_RESPONSE: ExternalApiCatResponse[] = [
    { name: 'Buffy', goodPoints: 10 },
    { name: 'Mitzi', goodPoints: 7 },
  ];

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit<CatsService>(CatsService).compile(true);

    catsService = unit;
    logger = unitRef.get(Logger);
    catsApiService = unitRef.get(CatsApiService);
    randomNameService = unitRef.get(RandomNameService);
  });

  describe('when getting all the cats', () => {
    let cats: ExternalApiCatResponse[];

    describe('without a replacement flag', () => {
      beforeAll(async () => {
        catsApiService.getCatsFromApi.mockImplementation(() =>
          Promise.resolve(EXTERNAL_API_RESPONSE)
        );

        cats = await catsService.getCats();
      });

      test('then call logger log', () => {
        expect(logger.log).toHaveBeenCalledWith(cats);
      });

      test('then dont call random name', () => {
        expect(randomNameService.getRandomName).not.toHaveBeenCalled();
      });

      test('then return the original cats list from the api', () => {
        expect(cats).toEqual(EXTERNAL_API_RESPONSE);
      });
    });
  });
});
