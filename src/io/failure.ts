import { IO } from ".";
import mapUnknownToError from "../utils/mapUnknownToError";

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

  static catch<A>(initial: any): IO<A> {
    return new Failure(mapUnknownToError(initial));
  }

  static of<A>(error: Error): IO<A> {
    return new Failure(error);
  }
}
