import type { ClassInjectable, InjectableRegistry } from '@suites/types.di';

export const FakeInject =
  (identifier: string | symbol): ParameterDecorator =>
  () =>
    identifier;

export class Axios {
  public get(url: string): Promise<string> {
    return Promise.resolve(`Response from ${url}`);
  }
}

export class HttpClient {
  public constructor(private readonly axios: Axios) {}

  public async get(url: string): Promise<string> {
    await this.axios.get(url);
    return `Response from ${url}`;
  }
}

export interface User {
  name: string;
  email: string;
}

export class TestLogger {
  public log(message: string): string {
    // Logs the message to the console or a logging service.
    return message;
  }
}

export interface Repository {
  find(query: string): Promise<string[]>;
  create(data: string): Promise<void>;
}

export class UserVerificationService {
  public verify(user: User): boolean {
    // Simulates user verification logic.
    return user.email.includes('@');
  }
}

export class ApiService {
  public constructor(
    private readonly httpClient: HttpClient,
    private readonly logger: TestLogger
  ) {}

  public async fetchData(endpoint: string): Promise<string> {
    this.logger.log('fetching data');
    return this.httpClient.get(endpoint);
  }
}

export class DatabaseService {
  public constructor(@FakeInject('Repository') private readonly repository: Repository) {}

  public async findData(query: string): Promise<string[]> {
    return this.repository.find(query);
  }

  public async saveData(data: string): Promise<void> {
    return this.repository.create(data);
  }
}

export class UserDigestService {
  public constructor(@FakeInject('SOME_VALUE_TOKEN') private readonly someValue: string[]) {}

  public digestUserData(user: User): string {
    // Simulates processing user data.
    return `Digested data for ${user.name}`;
  }
}

export class UserApiService {
  public constructor(
    private readonly userVerificationService: UserVerificationService,
    private readonly apiService: ApiService,
    private readonly userDigestService: UserDigestService
  ) {}

  public async getUserData(userId: string): Promise<string> {
    const data = await this.apiService.fetchData(`https://api.example.com/users/${userId}`);
    return `User Data: ${data}`;
  }

  public verifyUser(user: User): boolean {
    return this.userVerificationService.verify(user);
  }
}

export class UserDal {
  public constructor(
    private readonly userVerificationService: UserVerificationService,
    private readonly databaseService: DatabaseService,
    private readonly userDigestService: UserDigestService
  ) {}

  public async createUser(user: User): Promise<User> {
    if (this.userVerificationService.verify(user)) {
      await this.databaseService.saveData(JSON.stringify(user));
      return user;
    }

    throw new Error('Invalid user data');
  }

  public getUserDigest(user: User): string {
    return this.userDigestService.digestUserData(user);
  }
}

export class UserService {
  public constructor(
    private readonly userApiService: UserApiService,
    private readonly userDal: UserDal,
    private readonly logger: TestLogger,
    @FakeInject('SOME_VALUE_TOKEN') private readonly someValue: string[]
  ) {
    this.logger.log('Just logging a message');

    if (typeof this.logger.log !== 'function') {
      throw new Error('Logger mock is not correctly set up. `log` method is missing.');
    }

    this.logger.log('UserService initialized');
  }

  public async create(user: User): Promise<User> {
    this.logger.log(`Creating user: ${user.name}`);
    return this.userDal.createUser(user);
  }

  public async getUserInfo(userId: string): Promise<string> {
    return this.userApiService.getUserData(userId);
  }
}

export const userDalRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [
      { identifier: UserVerificationService, value: UserVerificationService, type: 'PARAM' },
      { identifier: DatabaseService, value: DatabaseService, type: 'PARAM' },
      { identifier: UserDigestService, value: UserDigestService, type: 'PARAM' },
    ];
  },
  resolve: () => undefined,
};

export const databaseServiceRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [{ identifier: 'Repository', value: Object, type: 'PARAM' }];
  },
  resolve: () => undefined,
};

export const httpClientRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [{ identifier: Axios, value: Axios, type: 'PARAM' }];
  },
  resolve: () => undefined,
};

export const apiServiceRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [
      { identifier: HttpClient, value: HttpClient, type: 'PARAM' },
      { identifier: TestLogger, value: TestLogger, type: 'PARAM' },
    ];
  },
  resolve: () => undefined,
};

export const userApiServiceRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [
      { identifier: UserVerificationService, value: UserVerificationService, type: 'PARAM' },
      { identifier: ApiService, value: ApiService, type: 'PARAM' },
      { identifier: UserDigestService, value: UserDigestService, type: 'PARAM' },
    ];
  },
  resolve: () => undefined,
};

export const userDigestServiceRegistry: InjectableRegistry = {
  list: (): ClassInjectable[] => [{ identifier: 'SOME_VALUE_TOKEN', type: 'PARAM', value: Array }],
  resolve: () => undefined,
};

export const emptyRegistry: InjectableRegistry = {
  list: (): ClassInjectable[] => [],
  resolve: () => undefined,
};

export const userServiceRegistry: InjectableRegistry = {
  list(): ClassInjectable[] {
    return [
      { identifier: UserApiService, value: UserApiService, type: 'PARAM' },
      { identifier: UserDal, value: UserDal, type: 'PARAM' },
      { identifier: TestLogger, value: TestLogger, type: 'PARAM' },
      { identifier: 'SOME_VALUE_TOKEN', value: Array, type: 'PARAM' },
    ];
  },
  resolve: () => undefined,
};
