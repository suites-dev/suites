import { CatsApiService } from './cats-api.service';
import { RandomNameService } from './random-name.service';
import { Logger } from './logger';
import { Reflectable } from '../src/lib/reflectable.decorator';

@Reflectable()
export class CatsService {
  public constructor(
    private readonly randomNameService: RandomNameService,
    private readonly catsApiExternalService: CatsApiService,
    private readonly logger: Logger
  ) {}

  /**
   * @param replace - pass to replace the original with random name
   */
  public async getCats(replace = false) {
    const catsList = await this.catsApiExternalService.getCatsFromApi();

    this.logger.log(catsList);

    return catsList.map((cat) => {
      const name = replace ? this.randomNameService.getRandomName() : cat.name;
      return { ...cat, name };
    });
  }
}
