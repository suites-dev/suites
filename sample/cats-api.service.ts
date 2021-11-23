import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export interface ExternalApiCatResponse {
  name: string;
  goodPoints: number;
}

@Injectable()
export class CatsApiService {
  public constructor(private readonly httpService: HttpService, private readonly logger: Logger) {}

  public async getCatsFromApi(): Promise<ExternalApiCatResponse[]> {
    const response = await this.httpService
      .get<ExternalApiCatResponse[]>('/cats')
      .toPromise()
      .catch(() => {
        this.logger.error('failed');
      });

    this.logger.log(response);

    return response?.data || Promise.reject('Failed to get user');
  }
}
