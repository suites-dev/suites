import FakerStatic = Faker.FakerStatic;
export declare class RandomNameService {
    private readonly faker;
    constructor(faker: FakerStatic);
    getRandomName(): string;
}
