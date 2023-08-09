import { IO } from "../io";
import { None } from "./none";

export abstract class Option<A> {
  public abstract get(): A;

  public abstract isDefined(): boolean;

  static f = <A>(f: () => A): Option<A> => IO.f(f).toOption();

  static pure = <A>(v: A): Option<A> => IO.pure(v).toOption();

  static promiseF = <A>(p: () => Promise<A>): Promise<Option<A>> =>
    p()
      .then((a) => Option.pure(a))
      .catch((_) => None.of<A>());

  static promise = <A>(p: Promise<A>): Promise<Option<A>> =>
    Option.promiseF(() => p);

  public map = <B>(f: (a: A) => B): Option<B> => {
    if (this.isDefined()) {
      return IO.f(() => f(this.get())).toOption();
    }
    return None.of<B>();
  };

  public flatMap = <B>(f: (a: A) => Option<B>): Option<B> => {
    if (this.isDefined()) {
      return f(this.get());
    }
    return None.of<B>();
  };

  public flatten = <B>(f: (a: A) => B): B => {
    if (this.isDefined()) {
      return f(this.get());
    }
    throw new Error("Cannot flatten a None");
  };

  public fold = <B>(someFunc: (a: A) => B, noneFunc: () => B): B => {
    if (this.isDefined()) {
      return someFunc(this.get());
    }
    return noneFunc();
  };

  public orElse = (defaultValue: A): A => {
    if (this.isDefined()) {
      return this.get();
    }
    return defaultValue;
  };
}
