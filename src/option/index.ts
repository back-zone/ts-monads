import { IO } from "../io";
import { FunctionParameter } from "../package-types";

export abstract class Option<A> {
  public abstract get(): A;

  public abstract isDefined(): boolean;

  static from<A>(f: FunctionParameter<any[], A>): Option<A> {
    return IO.from(f).toOption();
  }

  static pure<A>(v: A): Option<A> {
    return IO.pure(v).toOption();
  }

  static async promiseOf<A>(
    p: FunctionParameter<any[], Promise<A>>
  ): Promise<Option<A>> {
    return (await IO.promiseOf(p)).toOption();
  }

  static async promise<A>(p: Promise<A>): Promise<Option<A>> {
    return await Option.promiseOf(() => p);
  }

  public map<B>(f: (a: A) => B): Option<B> {
    if (this.isDefined()) {
      return IO.from(() => f(this.get())).toOption();
    }
    return None.of<B>();
  }

  public flatMap<B>(f: (a: A) => Option<B>): Option<B> {
    if (this.isDefined()) {
      return f(this.get());
    }
    return None.of<B>();
  }

  public flatten<B>(f: (a: A) => B): B {
    if (this.isDefined()) {
      return f(this.get());
    }
    throw new Error("Cannot flatten a None");
  }

  public fold<B>(someFunc: (a: A) => B, noneFunc: () => B): B {
    if (this.isDefined()) {
      return someFunc(this.get());
    }
    return noneFunc();
  }

  public orElse(defaultValue: A): A {
    if (this.isDefined()) {
      return this.get();
    }
    return defaultValue;
  }
}

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

  static of<A>(value: A): Option<A> {
    return new Some(value);
  }
}
