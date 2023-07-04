import { forwardRef, Inject } from '@nestjs/common';

type DummyType = string;

export class DependencyOne {
  print(): string {
    return 'dependencyOne';
  }
}

export class DependencyTwo {
  print(): string {
    return 'dependencyTwo';
  }
}

export class DependencyThree {
  print(): string {
    return 'dependencyThree';
  }
}

export class DependencyFourToken {
  print(): string {
    return 'dependencyFour';
  }
}

export class MainClass {
  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    @Inject(forwardRef(() => DependencyThree)) private readonly dependencyThree: DependencyThree,
    @Inject('CUSTOM_TOKEN') private readonly dependencyFour: DependencyFourToken,
    @Inject('CUSTOM_TOKEN') private readonly dummy: DummyType,
    @Inject('LITERAL_VALUE_ARR') private readonly literalValueArray: string[],
    @Inject('LITERAL_VALUE_STR') private readonly literalValueString: string
  ) {}
}
