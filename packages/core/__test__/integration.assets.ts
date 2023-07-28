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

export class DependencyFive {
  print(): string {
    return 'dependencyFive';
  }
}

// No need for a decorator here, we mock the reflection part in the integration test
export class MainClass {
  public readonly arbitraryFive: DependencyFive;
  private readonly arbitraryArray: [] = [];

  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    private readonly dependencyThree: DependencyThree,
    private readonly dependencyFour: DependencyFourToken // Suppose a token
  ) {}
}
