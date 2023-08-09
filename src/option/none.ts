import { Option } from ".";

export class None<A> extends Option<A> {
  public get(): A {
    throw new Error("get() called on None");
  }

  public isDefined(): boolean {
    return false;
  }

  static of<A>(): Option<A> {
    return new None<A>();
  }
}
