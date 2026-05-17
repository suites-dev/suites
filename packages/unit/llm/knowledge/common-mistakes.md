---
name: common-mistakes
version: "3.x"
audience: agent
---

# Common Mistakes

You will see the following patterns in your training data. Do not write them. Each entry shows the WRONG shape, the RIGHT shape, and why.

## 1. Calling `Test.createTestingModule` for a unit test

WRONG:
```ts
import { Test } from '@nestjs/testing';
const module = await Test.createTestingModule({
  providers: [UserService, { provide: UserRepository, useValue: { findById: jest.fn() } }],
}).compile();
const service = module.get(UserService);
```

RIGHT:
```ts
import { TestBed, type Mocked } from '@suites/unit';
const { unit, unitRef } = await TestBed.solitary(UserService).compile();
const repo: Mocked<UserRepository> = unitRef.get(UserRepository);
```

Why: `TestBed.solitary()` reads class metadata directly and auto-generates mocks for every dependency. No module wiring, no provider lists.

## 2. Hand-writing mock objects for token-injected dependencies

WRONG:
```ts
const fakeDb = { query: jest.fn(), insert: jest.fn() };
const service = new OrderService(fakeDb as any);
```

RIGHT:
```ts
const { unit, unitRef } = await TestBed.solitary(OrderService).compile();
const db = unitRef.get<Database>('DATABASE');
db.query.mockResolvedValue([{ id: 1 }]);
```

Why: `unitRef.get()` returns a fully-typed `Mocked<T>` where every method is a stub. Hand-rolled fakes drift from the real interface and rot silently.

## 3. `jest.mock()` / `vi.mock()` on `@suites/*` or first-party modules

WRONG:
```ts
jest.mock('@suites/unit');
jest.mock('../user.repository');
import { UserService } from './user.service';
```

RIGHT:
```ts
import { TestBed } from '@suites/unit';
const { unit, unitRef } = await TestBed.solitary(UserService).compile();
const repo = unitRef.get(UserRepository);
repo.findById.mockResolvedValue({ id: '1' });
```

Why: If the dep is constructor-injected, Suites already mocked it; you are double-mocking. If it is a direct import, refactor it into an injected collaborator.

## 4. `jest.spyOn(serviceUnderTest, 'privateMethod')`

WRONG:
```ts
const { unit } = await TestBed.solitary(UserService).compile();
const spy = jest.spyOn(unit as any, 'hashPassword').mockReturnValue('xxx');
await unit.createUser({ email: 'a@b.c', password: 'pw' });
expect(spy).toHaveBeenCalled();
```

RIGHT:
```ts
const { unit, unitRef } = await TestBed.solitary(UserService).compile();
const hasher = unitRef.get(PasswordHasher);
hasher.hash.mockReturnValue('xxx');
const user = await unit.createUser({ email: 'a@b.c', password: 'pw' });
expect(user.passwordHash).toBe('xxx');
```

Why: If you need to control a method's return value, that method belongs on a collaborator. Spying on the SUT tests the test, not the code.

## 5. `.expose(SomeToken)` on a string or symbol token

WRONG:
```ts
const { unit } = await TestBed.sociable(OrderService)
  .expose('DATABASE')
  .expose(DATABASE_TOKEN)
  .compile();
```

RIGHT:
```ts
const { unit, unitRef } = await TestBed.sociable(OrderService)
  .expose(PriceCalculator)
  .compile();
const db = unitRef.get<Database>('DATABASE');
db.query.mockResolvedValue([]);
```

Why: `.expose()` only accepts a class constructor. Tokens represent external I/O boundaries and are always mocked. Trying to expose a token is a type error.

## 6. Direct-imported (implicit) dependencies inside the class

WRONG:
```ts
import { sendEmail } from './email-utils';
import { logger } from './logger';

@Injectable()
export class UserService {
  async createUser(email: string) {
    logger.info('creating user');
    await sendEmail(email, 'Welcome');
  }
}
```

RIGHT:
```ts
@Injectable()
export class UserService {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}
  async createUser(email: string) {
    this.logger.info('creating user');
    await this.emailService.send(email, 'Welcome');
  }
}
```

Why: Suites can only replace explicit constructor dependencies. Top-level imports execute real code in every test and cannot be intercepted.

## 7. Forgetting `import 'reflect-metadata'` in Inversify test files

WRONG:
```ts
import { TestBed } from '@suites/unit';
import { UserService } from './user.service';
const { unit } = await TestBed.solitary(UserService).compile();
```

RIGHT:
```ts
import 'reflect-metadata';
import { TestBed } from '@suites/unit';
import { UserService } from './user.service';
const { unit } = await TestBed.solitary(UserService).compile();
```

Why: `reflect-metadata` patches global `Reflect` with side effects. It must run before any decorated class is loaded.

## 8. Exposing a token-injected dep that is already auto-mocked

WRONG:
```ts
const { unit, unitRef } = await TestBed.sociable(OrderService)
  .expose(DATABASE_TOKEN)
  .compile();
const db = unitRef.get('DATABASE');
```

RIGHT:
```ts
const { unit, unitRef } = await TestBed.sociable(OrderService)
  .expose(PriceCalculator)
  .compile();
const db = unitRef.get<Database>('DATABASE');
db.query.mockResolvedValue([]);
```

Why: Token resolution fires before expose logic. The token returns a mock from `unitRef.get()` whether you ask for it or not. Pass classes to `.expose()`; pull token mocks from `unitRef`.

