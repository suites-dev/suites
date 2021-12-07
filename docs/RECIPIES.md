# AutoMock Recipes

## Introduction
**TL;DR** \
We use one test template for all the frameworks! Why? because it's framework agnostic.

Welcome to the recipes page, we've tried (and still! PR are welcome) to show you
how `AutoMock` works with different frameworks. The prominent motive in these frameworks/libraries,
is the use of decorators in conjunction with dependency injection mechanisms.
This combination creates the perfect ecosystem which enable `AutoMock` to make use
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
import { Spec, MockOf } from '@automock/spec';
import { CatsService } from './cats.service';

describe('Unit Test Spec', () => {
  let queue: MockOf<Queue>;
  let catsApiService: MockOf<CatsApiService>;

  beforeAll(() => {
    const { unit, unitRef } = Spec.createUnit(CatsService)
      .mock('Queue')
      .using({
        action: async () => ({ data: 'some data' })
      })
      .compile();

    queue = unitRef.get('Queue');
    catsApiService = unitRef.get(CatsApiService);
  });

  describe('When something happens', () => {
    test('then triger logger error', () => {
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

</p></details>

### None Framework

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
