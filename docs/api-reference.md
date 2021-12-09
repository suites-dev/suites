# AutoMock API Reference

Consider the following service example, as we will use it as a reference

```typescript
export interface Logger {
  log: (msg: string) => void;
}

export class UserService {
  findOne(id: number): Promise<User> {}
}

@Refelectable()
export class MainService {
  constructor(
    @Token('Logger') private logger: Logger,
    private userSvc: UserService
  ) {}
  
  getUser(id: number) {
    const user = this.userSvc.findOne(number);
    this.logger.log(user);
  }
}
```

**Notice that**
\
Instead of using the `@Token` decorator, you need to use the decorator
of the framework you are using (e.g. `@Inject()` when using NestJS or Angular)

Instead of using the `@Reflectable` decorator, you need to decorate the class
with the relevant decorator (e.g. `@Injectable()` when using NestJS or Angular)

## Unit API

### `.create<TClass = any>(targetClass: Type<TClass>): UnitBuilder<TClass>`

Returns a new testing unit builder 

```typescript
import { Unit } from '@automock/unit';

const builder = Unit.create<MainService>(MainService);
```

<details><summary><code>💡 Hint</code></summary><p>

```
You need to use compile() in order to create a new testing unit
(read about compile() in the next sections.
```
</p></details>


## UnitBuilder API

### `.mock<T = any>(token: DependencyKey<T>): Override<T>;`
Mark the class, or the token you want to partially mock its implementation.
This will allow you to use `using()` on order to declare the new partial implementation
of the mock

```typescript
import { Unit } from '@automock/unit';

const builder = Unit.create<SomeService>(SomeService);

builder.mock(UserService)
```

<details><summary><code>💡 Hint</code></summary><p>

`DependencyKey<T>` type is actually:

```typescript
type DependencyKey<T = unknown> = string | Type<T>;
```
</p></details>

<br />

### `.using(mockImplementation: MockPartialImplementation<Partial>) => UnitBuilderr<TClass>`

The actual partial implementation of the subject mock

```typescript
import { Unit } from '@automock/unit';

Unit.create<MainService>(MainService)
  .mock(UserService)
  .using({
    async findOne(): Promise<string> {
      return { email: 'test@email.com', username: 'test-user' }
    },
  });

```

<details><summary><code>💡 Hint</code></summary><p>

```typescript
interface Override<Partial, TClass> {
  using: (mockImplementation: MockPartialImplementation<Partial>) => UnitBuilderr<TClass>;
}
```
</p></details>

<br />

### `.compile()`
Simply ignore some keys in the generated mock.

```typescript
const birdMock = MockFactory<Bird>(Bird).omit('canFly').one();
```

<details><summary><code>💡 Hint</code></summary><p>

```
.ignore() takes as many arguments as you want as long as they are strings
and they are part of the class properties

Bird class has 3 properties: 'name', 'isAwesome' and 'canFly';
In the example above will get a mock without the property 'canFly'.
```
</p></details>


What is this `@Reflectable()` decorator?

In order to reflect the constructor class params it needs to be decorated with any
class decorator, no matter what its original functionality.
If you are not using any kind of decorator, you can just use the default decorator that
does, literally, nothing; his purpose is to emit class metadata; so no w

But, for example, if you do use `@Injecatable()` (NestJS or Angular), `@Service()` (TypeDI),
`@Component()` or any kind of decorator, you don't need to decorate your class with
the `@Reflectable()` decorator.

