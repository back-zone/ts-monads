import { Either, Left, Right } from "../either";
import { None, Option, Some } from "../option";
import { FunctionParameter } from "../package-types";
import mapUnknownToError from "../utils/mapUnknownToError";

export abstract class IO<A> {
  public abstract isSuccess(): boolean;

  public abstract get(): A;

  public abstract error(): Error;

  static from<A>(f: FunctionParameter<any[], A>): IO<A> {
    try {
      const result = f();
      if (result instanceof Error) {
        return Failure.catch(result);
      }

      if (result === undefined || result === null) {
        return Failure.of(new Error("null/undefined"));
      }

      return Success.of(result);
    } catch (e) {
      return Failure.catch(e);
    }
  }

  static pure<A>(v: A): IO<A> {
    return IO.from(() => v);
  }

  static async promiseOf<A>(
    p: FunctionParameter<any[], Promise<A>>
  ): Promise<IO<A>> {
    try {
      const initial = await p();

      return IO.from(() => initial);
    } catch (error) {
      return Failure.catch(error);
    }
  }

  static async promise<A>(p: Promise<A>): Promise<IO<A>> {
    return await IO.promiseOf(() => p);
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

  public fold<B>(successFunc: (args: A) => B, errorFunc: (_: Error) => B): B {
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

export class Success<A> extends IO<A> {
  constructor(private readonly value: A) {
    super();
  }

  public isSuccess(): boolean {
    return true;
  }

  public get(): A {
    return this.value;
  }

  public error(): Error {
    throw new Error("Error called on success");
  }

  static of<A>(a: A): IO<A> {
    return new Success(a);
  }
}

export class Failure<A> extends IO<A> {
  constructor(private readonly value: Error) {
    super();
  }

  public isSuccess(): boolean {
    return false;
  }

  public get(): A {
    throw new Error("get() called on Failure");
  }

  public error(): Error {
    return this.value;
  }

  static catch<A>(initial: unknown): IO<A> {
    return new Failure(mapUnknownToError(initial));
  }

  static of<A>(error: Error): IO<A> {
    return new Failure(error);
  }
}
