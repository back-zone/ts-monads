import { IO } from ".";
import mapUnknownToError from "../utils/mapUnknownToError";

export class Failure<A> extends IO<A> {
  private readonly value: Error;

  constructor(initial: Error) {
    super();
    this.value = initial;
  }

  error(): Error {
    return this.value;
  }

  get(): A {
    throw new Error("get called on failure!");
  }

  isSuccess(): boolean {
    return false;
  }

  static buildFrom<A>(initial: Error): Failure<A> {
    return new Failure(initial);
  }

  static fromCatch<A>(initial: any): Failure<A> {
    return new Failure(mapUnknownToError(initial));
  }
}
