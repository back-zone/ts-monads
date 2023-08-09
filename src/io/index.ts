import mapUnknownToError from "../utils/mapUnknownToError";
import { Failure } from "./failure";
import { Success } from "./sucess";

export abstract class IO<A> {
  public abstract isSuccess(): boolean;

  public abstract get(): A;

  public abstract error(): Error;

  public map<B>(f: (_: A) => B): IO<B> {
    if (this.isSuccess()) {
      return IO.from(() => f(this.get()));
    }

    return new Failure(this.error());
  }

  public flatten<B>(f: (_: IO<A>) => B): IO<B> {
    if (this.isSuccess()) {
      return IO.from(() => f(IO.pure(this.get())));
    }

    return new Failure(this.error());
  }

  public flatMap<B>(f: (_: A) => IO<B>): IO<B> {
    if (this.isSuccess()) {
      return f(this.get());
    }

    return new Failure(this.error());
  }

  public fold<B>(successFunc: (_: A) => B, errorFunc: (_: Error) => B): B {
    if (this.isSuccess()) {
      return successFunc(this.get());
    }

    return errorFunc(this.error());
  }

  public orElse(defaultValue: A): A {
    if (this.isSuccess()) {
      return this.get();
    }
    return defaultValue;
  }

  public checkError(errorHandler: (_: Error) => A): A {
    if (this.isSuccess()) {
      return this.get();
    }

    return errorHandler(this.error());
  }

  static pure<A>(value: A): IO<A> {
    return IO.from(() => value);
  }

  static from<A>(f: () => A): IO<A> {
    try {
      const result: A = f();
      return new Success(result);
    } catch (e) {
      return new Failure(mapUnknownToError(e));
    }
  }

  static fromPromise = async <A>(f: Promise<A>): Promise<IO<A>> => {
    try {
      const initial = await Promise.resolve(f);
      return Success.buildFrom(initial);
    } catch (error) {
      return Failure.fromCatch(error);
    }
  };
}
