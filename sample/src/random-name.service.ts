import { Reflectable } from '@automock/reflect';

@Reflectable()
export class RandomNameService {
  public getRandomName(): string {
    return 'some-random-name';
  }
}
