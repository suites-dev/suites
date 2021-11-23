import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
export interface ExternalApiCatResponse {
    name: string;
    goodPoints: number;
}
export declare class CatsApiService {
    private readonly httpService;
    private readonly logger;
    constructor(httpService: HttpService, logger: Logger);
    getCatsFromApi(): Promise<ExternalApiCatResponse[]>;
}
