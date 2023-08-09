import { Option } from ".";

export class Some<A> extends Option<A> {
  constructor(private readonly value: A) {
    super();
  }

  public get(): A {
    return this.value;
  }

  public isDefined(): boolean {
    return true;
  }

  static of = <A>(value: A): Option<A> => new Some(value);
}
