import isEqual from 'lodash.isequal';
import {
  DependencyInjectionAdapter,
  ClassInjectable,
  IdentifierMetadata,
  UndefinedDependency,
  WithMetadata,
} from '@suites/types.di';
import { Type } from '@suites/types.common';
import { normalizeIdentifier } from '../../../src/normalize-identifier.static';

interface Printer {
  print(): string;
}

export class ArbitraryClassOne {
  print(): string {
    return this.constructor.name;
  }
}

export class ArbitraryClassTwo {
  print(): string {
    return this.constructor.name;
  }
}

export class ArbitraryClassThree {
  print(): string {
    return this.constructor.name;
  }
}

export class ArbitraryClassFour {
  print(): string {
    return this.constructor.name;
  }
}

export class ArbitraryClassFive {
  print(): string {
    return this.constructor.name;
  }
}

export class ArbitraryClassSix {
  print(): string {
    return this.constructor.name;
  }
}
export class ArbitraryClassSeven {
  print(): string {
    return this.constructor.name;
  }
}

export class ClassFromToken {
  print(): string {
    return this.constructor.name;
  }
}

export class StubbedClass {
  print(): string {
    return 'Stubbed';
  }
}

/**
 * We create the ClassUnderTest with no decorators because the reflection
 * is being mocked in this integration test. But what we do want to check
 * is that all the class properties have been initiated properly, as well
 * as the constructor parameters. The list of injectables from the mocked
 * adapter should match exactly the order of the parameters in the constructor,
 * as we verify this in the integration test.
 */
export class ClassUnderTest {
  public arbitraryThree: ArbitraryClassThree;
  public arbitraryFour: ArbitraryClassFour;
  public arbitraryProperty: string;
  public withMetadata: StubbedClass;
  public withMetadataSecond: StubbedClass;
  public arbitrary: StubbedClass;

  public constructor(
    private readonly one: Printer,
    private readonly two: Printer,
    private readonly twoSecond: Printer,
    private readonly five: Printer,
    private readonly sixWithToken: Printer,
    private readonly tokenUndefined: Printer,
    private readonly justToken: Printer
  ) {}

  public getArguments() {
    return [
      this.one,
      this.two,
      this.twoSecond,
      this.five,
      this.sixWithToken,
      this.tokenUndefined,
      this.justToken,
    ];
  }

  public getProperties() {
    return Object.keys(this);
  }
}

export const symbolIdentifier = Symbol.for('TOKEN_METADATA');

const classInjectables: ClassInjectable[] = [
  { identifier: ArbitraryClassOne, value: ArbitraryClassOne, type: 'PARAM' },
  // We put the same class twice to test that the mocker, it is not a mistake
  { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
  { identifier: ArbitraryClassTwo, value: ArbitraryClassTwo, type: 'PARAM' },
  { identifier: ArbitraryClassFive, value: UndefinedDependency, type: 'PARAM' },
  {
    identifier: 'ArbitraryClassSix',
    metadata: { metadataKey: 'value' },
    value: ArbitraryClassSix,
    type: 'PARAM',
  } as WithMetadata<never>,
  { identifier: 'TOKEN_WITH_UNDEFINED', value: UndefinedDependency, type: 'PARAM' },
  { identifier: 'TOKEN', value: ClassFromToken, type: 'PARAM' },
  {
    type: 'PROPERTY',
    property: { key: 'arbitraryThree' },
    identifier: ArbitraryClassThree,
    value: ArbitraryClassThree,
  },
  {
    type: 'PROPERTY',
    property: { key: 'withMetadata' },
    metadata: { key: 'value' },
    identifier: ArbitraryClassSeven,
    value: ArbitraryClassSeven,
  } as ClassInjectable,
  {
    type: 'PROPERTY',
    property: { key: 'withMetadataSecond' },
    metadata: { key: 'value' },
    identifier: symbolIdentifier,
    value: ArbitraryClassSeven,
  } as ClassInjectable,
  {
    type: 'PROPERTY',
    property: { key: 'arbitraryFour' },
    identifier: ArbitraryClassFour,
    value: ArbitraryClassFour,
  },
  {
    type: 'PROPERTY',
    property: { key: 'arbitraryProperty' },
    identifier: 'STRING_TOKEN',
    value: String,
  },
  {
    type: 'PROPERTY',
    property: { key: 'arbitrary' },
    identifier: 'ANOTHER_TOKEN',
    value: String,
  },
];

export const FakeDIAdapter: DependencyInjectionAdapter = {
  inspect: () => {
    return {
      list: () => classInjectables,
      resolve(
        identifier: Type | string,
        metadata?: IdentifierMetadata
      ): ClassInjectable | undefined {
        return classInjectables.find((injectable: WithMetadata<never>) => {
          const subject = normalizeIdentifier(identifier, metadata as never);
          const toFind = normalizeIdentifier(injectable.identifier, injectable.metadata);

          return isEqual(toFind, subject);
        });
      },
    };
  },
};
