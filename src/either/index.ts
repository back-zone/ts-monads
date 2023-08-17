import { IO } from "../io";
import { FunctionParameter } from "../package-types";

export abstract class Either<L, R> {
  public abstract isLeft(): boolean;

  public abstract left(): L;

  public abstract right(): R;

  static from<R>(f: FunctionParameter<any[], R>): Either<Error, R> {
    return IO.from(f).toEither();
  }

  static pure<R>(v: R): Either<Error, R> {
    return IO.pure(v).toEither();
  }

  static async promiseOf<R>(
    p: FunctionParameter<any[], Promise<R>>
  ): Promise<Either<Error, R>> {
    return (await IO.promiseOf(p)).toEither();
  }

  static async promise<R>(p: Promise<R>): Promise<Either<Error, R>> {
    return await Either.promiseOf(() => p);
  }

  public map<B>(f: (a: R) => B): Either<L, B> {
    if (this.isLeft()) {
      return Left.of(this.left());
    }

    return Right.of(f(this.right()));
  }

  public flatMap<B>(f: (a: R) => Either<L, B>): Either<L, B> {
    if (this.isLeft()) {
      return Left.of(this.left());
    }

    return f(this.right());
  }

  public fold<B>(successFunc: (a: R) => B, errorFunc: (a: L) => B): B {
    if (this.isLeft()) {
      return errorFunc(this.left());
    }

    return successFunc(this.right());
  }

  public flatten<B>(f: (a: R) => B): B {
    if (this.isLeft()) {
      throw new Error("Cannot flatten a left");
    }

    return f(this.right());
  }

  public orElse(defaultValue: R): R {
    if (this.isLeft()) {
      return defaultValue;
    }

    return this.right();
  }

  public mapLeft<LB>(errorFunc: (a: L) => LB): Either<LB, R> {
    if (this.isLeft()) {
      return Left.of(errorFunc(this.left()));
    }

    return Right.of(this.right());
  }
}

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
