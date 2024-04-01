import {
  delay,
  inject,
  injectAll,
  injectAllWithTransform,
  injectWithTransform,
  injectable,
} from 'tsyringe';

type DummyType = string;

export const SymbolToken = Symbol.for('CUSTOM_TOKEN');

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

class FeatureFlags {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getFlagValue(_flagName: string): boolean {
    return true;
  }
}

class FeatureFlagsTransformer {
  public transform(flags: FeatureFlags, flag: string) {
    return flags.getFlagValue(flag);
  }
}

@injectable()
class Baz {
  public value: string;
}

class BazTransform {
  public transform(bazes: Baz[]): string[] {
    return bazes.map((f) => f.value);
  }
}

@injectable()
export class ConstructorBasedInjectionClass {
  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    @inject(DependencyThree) private readonly dependencyThree: Record<string, string>,
    @inject(delay(() => DependencySix)) private readonly dependencySix: undefined,
    @inject(SymbolToken) private readonly dependencyFour: DependencyFourTokenInterface,
    @inject('CUSTOM_TOKEN_SECOND') private readonly dependencyMissingWithToken: undefined,
    @inject('ANOTHER_CUSTOM_TOKEN') private readonly dummy: DummyType,
    @injectAll('LITERAL_VALUE_ARR') private readonly literalValueArray: string[],
    @injectWithTransform(FeatureFlags, FeatureFlagsTransformer, 'IsBlahEnabled')
    isEnabled: boolean,
    @injectAllWithTransform(Baz, BazTransform, 'All') stringArray: string[],
    @inject('LITERAL_VALUE_STR') private readonly literalValueString: string
  ) {}
}

@injectable()
export class ClassWithUndefinedDependency {
  public constructor(private readonly dependency: undefined) {}
}
