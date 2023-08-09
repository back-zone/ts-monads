import { Either } from "../either";
import { Left } from "../either/left";
import { Right } from "../either/right";
import { Option } from "../option";
import { None } from "../option/none";
import { Some } from "../option/some";
import mapUnknownToError from "../utils/mapUnknownToError";
import { Failure } from "./failure";
import { Success } from "./sucess";

export abstract class IO<A> {
  public abstract isSuccess(): boolean;

  public abstract get(): A;

  public abstract error(): Error;

  static from<A>(f: () => A): IO<A> {
    try {
      return Success.of(f());
    } catch (e) {
      return Failure.catch(e);
    }
  }

  static pure<A>(v: A): IO<A> {
    return IO.from(() => v);
  }

  static promiseOf<A>(p: () => Promise<A>): Promise<IO<A>> {
    return p()
      .then((a) => IO.pure(a))
      .catch((error) => Failure.catch(mapUnknownToError(error)));
  }

  static promise<A>(p: Promise<A>): Promise<IO<A>> {
    return IO.promiseOf(() => p);
  }

  public map<B>(f: (a: A) => B): IO<B> {
    if (this.isSuccess()) {
      return IO.from(() => f(this.get()));
    }
    return Failure.catch(this.error());
  }

  public flatMap<B>(f: (a: A) => IO<B>): IO<B> {
    if (this.isSuccess()) {
      return f(this.get());
    }
    return Failure.catch(this.error());
  }

  public fold<B>(successFunc: (_: A) => B, errorFunc: (_: Error) => B): B {
    if (this.isSuccess()) {
      return successFunc(this.get());
    }
    return errorFunc(this.error());
  }

  public flatten<B>(f: (_: A) => B): B {
    if (this.isSuccess()) {
      return f(this.get());
    }

    throw this.error();
  }

  public orElse(defaultValue: A): A {
    if (this.isSuccess()) {
      return this.get();
    }
    return defaultValue;
  }

  public mapError(errorHandler: (_: Error) => A): A {
    if (this.isSuccess()) {
      return this.get();
    }

    return errorHandler(this.error());
  }

  public toEither(): Either<Error, A> {
    if (this.isSuccess()) {
      return Right.of(this.get());
    }

    return Left.of(this.error());
  }

  public toOption(): Option<A> {
    if (this.isSuccess()) {
      return Some.of(this.get());
    }

    return None.of<A>();
  }
}
