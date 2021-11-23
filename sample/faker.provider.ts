import * as faker from 'faker';
import { ValueProvider } from '@nestjs/common';

export const FakerProvider: ValueProvider<typeof faker> = {
  provide: 'Faker',
  useValue: faker,
};
