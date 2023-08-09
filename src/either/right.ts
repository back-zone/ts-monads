import { Either } from ".";

export class Right<L, R> extends Either<L, R> {
  constructor(private readonly value: R) {
    super();
  }

  public isLeft(): boolean {
    return false;
  }

  public left(): L {
    throw new Error("lef() called on Right");
  }

  public right(): R {
    return this.value;
  }

  static of<L, R>(value: R): Either<L, R> {
    return new Right(value);
  }
}
