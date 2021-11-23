import { Logger } from '@nestjs/common';
import { CatsApiService } from './cats-api.service';
import { RandomNameService } from './random-name.service';
export declare class CatsService {
    private readonly randomNameService;
    private readonly catsApiExternalService;
    private readonly logger;
    constructor(randomNameService: RandomNameService, catsApiExternalService: CatsApiService, logger: Logger);
    /**
     * @param replace - pass to replace the original with random name
     */
    getCats(replace?: boolean): Promise<{
        name: string;
        goodPoints: number;
    }[]>;
}
