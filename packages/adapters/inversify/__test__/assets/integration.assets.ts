import {
  inject,
  injectable,
  LazyServiceIdentifer,
  multiInject,
  named,
  tagged,
  targetName,
  unmanaged,
} from 'inversify';

const throwable = tagged('canThrow', true);

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

export class DependencyFour {
  print(): string {
    return 'dependencySix';
  }
}

export class DependencySix {
  print(): string {
    return 'dependencySix';
  }
}

export class DependencySeven {
  print(): string {
    return 'dependencySeven';
  }
}

export class DependencyEight {
  print(): string {
    return 'dependencyEight';
  }
}

export class DependencyNine {
  print(): string {
    return 'dependencyNine';
  }
}

export class DependencyTen {
  print(): string {
    return 'dependencyTen';
  }
}

export const SymbolToken = Symbol.for('SymbolToken');

@injectable()
export class ConstructorBasedInjectionClass {
  public constructor(
    @inject('Interface')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @targetName('dependencyOne')
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    @inject('Interface')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    @targetName('dependencyFive')
    private readonly dependencyFive: DependencyFive,
    @inject('CUSTOM_TOKEN')
    @throwable
    private readonly dependencyFour: DependencyFour,
    @inject(DependencySix)
    @tagged('tagged', 'withValue')
    private readonly dependencySix: DependencySix,
    @inject(new LazyServiceIdentifer(() => DependencySeven))
    private readonly dependencySeven: DependencySeven,
    @inject('CUSTOM_TOKEN_SECOND') private readonly dependencyMissingWithToken: undefined,
    @inject(SymbolToken) private readonly dummy: DummyType,
    @multiInject('LITERAL_VALUE_ARR') private readonly literalValueArray: string[],
    @inject('LITERAL_VALUE_STR') private readonly literalValueString: string,
    @named('arbitrary-name') private readonly dependencyEight: DependencyEight,
    @unmanaged() private readonly dependencyNice: DependencyNine,
    @inject(DependencyTen) @throwable private readonly testClassTen: DummyType
  ) {}
}

@injectable()
export class PropertiesBasedInjectionClass {
  @inject('Interface')
  private readonly dependencyOne: DependencyOne;

  private readonly dependencyTwo: DependencyTwo;

  @inject('CUSTOM_TOKEN')
  @throwable
  private readonly dependencyFour: DependencyFour;

  @inject(new LazyServiceIdentifer(() => DependencyThree))
  private readonly dependencyThree: DependencyThree;

  @inject(new LazyServiceIdentifer(() => DependencySix))
  @tagged('tagged', 'withValue')
  private readonly dependencySix: undefined;

  @inject('CUSTOM_TOKEN_SECOND')
  private readonly dependencyMissingWithToken: undefined;

  @inject('ANOTHER_CUSTOM_TOKEN')
  private readonly dummy: DummyType;

  @multiInject(SymbolToken)
  private readonly literalValueArray: string[];

  @inject('LITERAL_VALUE_STR')
  private readonly literalValueString: string;
}

@injectable()
export class ConstructorCombinedWithPropsClass {
  @inject('CUSTOM_TOKEN')
  private readonly dependencyFour: DependencyFourTokenInterface;

  @inject('LITERAL_VALUE_STR')
  private readonly literalValueString: string;

  @inject(new LazyServiceIdentifer(() => DependencyThree))
  private readonly dependencyThree: DependencyThreeInterface;

  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo
  ) {}
}
