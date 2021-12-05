# AromaJS Recipes

## Introduction
**TL;DR** \
We use one test file for all the frameworks! Why? because it's framework agnostic.
The only thing different is the actual source class/service.


Welcome to the recipes page, we've tried (and still! PR are welcome) to show you
how `AromaJS` works with different frameworks. The prominent motive in these frameworks/libraries,
is the use of decorators in conjunction with dependency injection mechanisms.
This combination creates the perfect ecosystem which enable `AromaJS` to make use
of these decorators using a simple reflection mechanism.

🤔 If you want to read more about how `AromaJS` works, jump to the `API Reference` [here](http://)

## Spec File
**Choose your combination:**

<details><summary><code>Mocha + Chai + Sinon</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>
<br />


<details><summary><code>Jest</code></summary><p>

```typescript
import { Spec, MockOf } from '@aromajs/jest';
import { CatsService } from './cats.service';

describe('Unit Test Spec', () => {
  let queue: MockOf<Queue>;
  let catsApiService: MockOf<CatsApiService>;

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit(CatsService)
      .mock('QUEUE_TOKEN')
      .using({
        action: async () => ({ data: 'some data' })
      })
      .compile();

    queue = unitRef.get('QUEUE_TOKEN');
    catsApiService = unitRef.get(CatsApiService);
  });

  describe('Test something you need', () => {
    test('test ', () => {
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
```
</p></details>
<br />


<details><summary><code>Ava + Sinon</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>
<br />


### NestJS

```typescript
import { Injectable, Inject } from '@nestjs/common';

interface Queue {}

@Injectable()
export class AwesomeService {
  public constructor(
    private readonly apiService: ThirdPartyApiService,
    @Inject('PROVIDER_TOKEN') private readonly provider: Interface,
  ) {}
}
```

<details><summary><code>💡 More Info</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>
<br />

### Angular

```typescript
// Code here
```

<details><summary><code>💡 More Info</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>
<br />

### TypeDI

```typescript
// Code here
```

<details><summary><code>💡 More Info</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>

<br />


### Framework Free

```typescript
// Code here
```

<details><summary><code>💡 More Info</code></summary><p>

```
This method can not be chained,
it just return an mock which is an instance of the class Bird
```
</p></details>

<br />
