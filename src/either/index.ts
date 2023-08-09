import { IO } from "../io";
import { Left } from "./left";
import { Right } from "./right";

export abstract class Either<L, R> {
  public abstract isLeft(): boolean;

  public abstract left(): L;

  public abstract right(): R;

  static f = <R>(f: () => R): Either<Error, R> => IO.f(f).toEither();

  static pure = <R>(v: R): Either<Error, R> => IO.pure(v).toEither();

  static promiseF = <R>(p: () => Promise<R>): Promise<Either<Error, R>> =>
    p()
      .then((r) => Either.pure(r))
      .catch((error) => Left.of(error));

  static promise = <R>(p: Promise<R>): Promise<Either<Error, R>> =>
    Either.promiseF(() => p);

  public map = <B>(f: (a: R) => B): Either<L, B> => {
    if (this.isLeft()) {
      return Left.of(this.left());
    }

    return Right.of(f(this.right()));
  };

  public flatMap = <B>(f: (a: R) => Either<L, B>): Either<L, B> => {
    if (this.isLeft()) {
      return Left.of(this.left());
    }

    return f(this.right());
  };

  public fold = <B>(successFunc: (a: R) => B, errorFunc: (a: L) => B): B => {
    if (this.isLeft()) {
      return errorFunc(this.left());
    }

    return successFunc(this.right());
  };

  public flatten = <B>(f: (a: R) => B): B => {
    if (this.isLeft()) {
      throw new Error("Cannot flatten a left");
    }

    return f(this.right());
  };

  public orElse = (defaultValue: R): R => {
    if (this.isLeft()) {
      return defaultValue;
    }

    return this.right();
  };

  public mapLeft = <LB>(errorFunc: (a: L) => LB): Either<LB, R> => {
    if (this.isLeft()) {
      return Left.of(errorFunc(this.left()));
    }

    return Right.of(this.right());
  };
}
