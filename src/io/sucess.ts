import { IO } from ".";

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
