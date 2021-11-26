import { Reflectable } from '../test/spec-assets';

@Reflectable()
export class RandomNameService {
  public getRandomName(): string {
    return 'some-random-name';
  }
}
