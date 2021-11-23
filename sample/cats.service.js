"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatsService = void 0;
const common_1 = require("@nestjs/common");
const cats_api_service_1 = require("./cats-api.service");
const random_name_service_1 = require("./random-name.service");
let CatsService = class CatsService {
    constructor(randomNameService, catsApiExternalService, logger) {
        this.randomNameService = randomNameService;
        this.catsApiExternalService = catsApiExternalService;
        this.logger = logger;
    }
    /**
     * @param replace - pass to replace the original with random name
     */
    async getCats(replace = false) {
        const catsList = await this.catsApiExternalService.getCatsFromApi();
        this.logger.log(catsList);
        return catsList.map((cat) => {
            const name = replace ? this.randomNameService.getRandomName() : cat.name;
            return Object.assign(Object.assign({}, cat), { name });
        });
    }
};
CatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [random_name_service_1.RandomNameService,
        cats_api_service_1.CatsApiService,
        common_1.Logger])
], CatsService);
exports.CatsService = CatsService;
