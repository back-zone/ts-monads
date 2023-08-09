import { IO } from ".";

export class Success<A> extends IO<A> {
  private readonly value: A;

  constructor(initial: A) {
    super();
    this.value = initial;
  }

  error(): Error {
    throw new Error("error called on success!");
  }

  get(): A {
    return this.value;
  }

  isSuccess(): boolean {
    return true;
  }

  static buildFrom<A>(initial: A): Success<A> {
    return new Success(initial);
  }
}
