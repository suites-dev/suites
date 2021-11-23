import { Inject, Injectable } from '@nestjs/common';
import * as Faker from 'faker';
import FakerStatic = Faker.FakerStatic;

@Injectable()
export class RandomNameService {
  public constructor(@Inject('Faker') private readonly faker: FakerStatic) {}

  public getRandomName(): string {
    return this.faker.animal.cat();
  }
}
