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

export class MainClass {
  public constructor(
    private readonly dependencyOne: DependencyOne,
    private readonly dependencyTwo: DependencyTwo,
    private readonly dependencyThree: DependencyThree,
    private readonly dependencyFour: DependencyFourToken // Suppose a token
  ) {}
}
