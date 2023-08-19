export class ArbitraryClassOne {
  print(): string {
    return 'dependency';
  }
}

export class ArbitraryClassTwo {
  print(): string {
    return 'dependency';
  }
}

export class ArbitraryClassThree {
  print(): string {
    return 'dependency';
  }
}

export class ArbitraryClassFour {
  print(): string {
    return 'dependency';
  }
}

export class ArbitraryClassFive {
  print(): string {
    return 'dependency';
  }
}

export class ArbitraryClassSix {
  print(): string {
    return 'dependency';
  }
}
export class ArbitraryClassSeven {
  print(): string {
    return 'dependency';
  }
}

export class ClassFromToken {
  print(): string {
    return 'dependency';
  }
}
export class StubbedClass {}

export class ClassUnderTest {
  public arbitraryThree: ArbitraryClassThree;
  public arbitraryFour: ArbitraryClassFour;
  public arbitraryProperty: string;
  public withMetadata: StubbedClass;
  public withMetadataSecond: StubbedClass;
  public arbitrary: StubbedClass;
}
