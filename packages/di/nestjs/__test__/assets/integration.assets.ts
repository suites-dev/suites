import { forwardRef, Inject, Injectable } from '@nestjs/common';

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

export class DependencyFive {
  print(): string {
    return 'dependencyFive';
  }
}

export class DependencySix {
  print(): string {
    return 'dependencySix';
  }
}

@Injectable()
export class ConstructorBasedInjectionClass {
  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    @Inject(forwardRef(() => DependencyThree)) private readonly dependencyThree: DependencyThree,
    @Inject(forwardRef(() => 'SOME_TOKEN_FROM_REF'))
    private readonly dependencyFive: DependencyFive,
    @Inject(forwardRef(() => DependencySix)) private readonly dependencySix: undefined,
    @Inject('CUSTOM_TOKEN') private readonly dependencyFour: DependencyFourTokenInterface,
    @Inject('CUSTOM_TOKEN_SECOND') private readonly dependencyMissingWithToken: undefined,
    @Inject('ANOTHER_CUSTOM_TOKEN') private readonly dummy: DummyType,
    @Inject('LITERAL_VALUE_ARR') private readonly literalValueArray: string[],
    @Inject('LITERAL_VALUE_STR') private readonly literalValueString: string
  ) {}
}

@Injectable()
export class PropsBasedMainClass {
  @Inject(DependencyOne)
  private readonly dependencyOne: DependencyOne;

  @Inject(DependencyTwo)
  private readonly dependencyTwo: DependencyTwo;

  @Inject(forwardRef(() => DependencyThree))
  private readonly dependencyThree: DependencyThree;

  @Inject(forwardRef(() => DependencySix))
  private readonly dependencySix: undefined;

  @Inject('CUSTOM_TOKEN')
  public readonly dependencyFour: DependencyFourTokenInterface;

  @Inject(DependencyFive)
  public readonly dependencyMissingWithToken: undefined;

  @Inject('CUSTOM_TOKEN_SECOND')
  public readonly dependencyUndefinedWithToken: undefined;

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

  @Inject(forwardRef(() => DependencyThree))
  private readonly dependencyThree: DependencyThreeInterface;

  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo
  ) {}
}

@Injectable()
export class ClassWithUndefinedDependency {
  public constructor(private readonly dependency: undefined) {}
}

@Injectable()
export class ClassWithUndefinedDependencyProps {
  @Inject(undefined)
  private readonly dependency: undefined;
}
