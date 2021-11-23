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
exports.CatsApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let CatsApiService = class CatsApiService {
    constructor(httpService, logger) {
        this.httpService = httpService;
        this.logger = logger;
    }
    async getCatsFromApi() {
        const response = await this.httpService
            .get('/cats')
            .toPromise()
            .catch(() => {
            this.logger.error('failed');
        });
        this.logger.log(response);
        return (response === null || response === void 0 ? void 0 : response.data) || Promise.reject('Failed to get user');
    }
};
CatsApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService, common_1.Logger])
], CatsApiService);
exports.CatsApiService = CatsApiService;
