import { Reflectable } from '@automock/reflect';
import { Logger } from './logger';

export interface ExternalApiCatResponse {
  name: string;
  goodPoints: number;
}

class HttpService {
  public async get(): Promise<ExternalApiCatResponse[]> {
    return [{ goodPoints: 10, name: 'Cat' }];
  }
}

@Reflectable()
export class CatsApiService {
  public constructor(private readonly httpService: HttpService, private readonly logger: Logger) {}

  public async getCatsFromApi(): Promise<ExternalApiCatResponse[]> {
    const response = await this.httpService.get().catch(() => {
      this.logger.error('failed');
    });

    this.logger.log(response);

    return response || Promise.reject('Failed to get user');
  }
}
