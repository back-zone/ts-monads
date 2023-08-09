import { Either } from ".";

export class Left<L, R> extends Either<L, R> {
  constructor(private readonly value: L) {
    super();
  }

  public isLeft(): boolean {
    return true;
  }

  public left(): L {
    return this.value;
  }

  public right(): R {
    throw new Error("right() called on Left");
  }

  static of<L, R>(value: L): Either<L, R> {
    return new Left(value);
  }
}
