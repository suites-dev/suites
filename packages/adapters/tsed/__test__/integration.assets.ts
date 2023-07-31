import { Inject, Injectable } from '@tsed/di';

// type DummyType = string;

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

interface DependencyThreeInterface {
  print(): string;
}

export class DependencyThree implements DependencyThreeInterface {
  print(): string {
    return 'dependencyThree';
  }
}

export interface DependencyFourTokenInterface {
  print(): string;
}

@Injectable()
export class ConstructorBasedInjectionClass {
  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo // @Inject(forwardRef(() => DependencyThree)) private readonly dependencyThree: DependencyThree, // @Inject('CUSTOM_TOKEN') private readonly dependencyFour: DependencyFourTokenInterface, // @Inject('ANOTHER_CUSTOM_TOKEN') private readonly dummy: DummyType, // @Inject('LITERAL_VALUE_ARR') private readonly literalValueArray: string[], // @Inject('LITERAL_VALUE_STR') private readonly literalValueString: string
  ) {}
}

@Injectable()
export class PropsBasedMainClass {
  @Inject(DependencyOne)
  private readonly dependencyOne: DependencyOne;

  @Inject(DependencyTwo)
  private readonly dependencyTwo: DependencyTwo;

  // @Inject(forwardRef(() => DependencyThree))
  // private readonly dependencyThree: DependencyThree;

  @Inject('CUSTOM_TOKEN')
  public readonly dependencyFour: DependencyFourTokenInterface;

  @Inject('LITERAL_VALUE_ARR')
  private readonly literalValueArray: string[];

  @Inject('LITERAL_VALUE_STR')
  private readonly literalValueString: string;
}

@Injectable()
export class ConstructorCombinedWithPropsClass {
  @Inject('CUSTOM_TOKEN')
  private readonly dependencyFour: DependencyFourTokenInterface;

  @Inject('LITERAL_VALUE_STR')
  private readonly literalValueString: string;

  // @Inject(forwardRef(() => DependencyThree))
  // private readonly dependencyThree: DependencyThreeInterface;

  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo
  ) {}
}
