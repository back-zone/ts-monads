import { Option } from "../src/option";

const str = "str";
const some = (str: string) => str;
const none = (str: string): string => {
  throw new Error(str);
};
const definitelyNull = (): string | null => null;
const definitelyUndefined = (): string | undefined => undefined;
const promiseSome = async (str: string): Promise<string> =>
  await Promise.resolve(str);
const promiseNone = async (str: string): Promise<string> => {
  throw new Error(str);
};
const promiseDefinitelyNull = async (): Promise<string | null> =>
  Promise.resolve(null);
const promiseDefinitelyUndefined = async (): Promise<string | undefined> =>
  Promise.resolve(undefined);

describe("Opiton", () => {
  describe("from", () => {
    it("should return Some from Success", () => {
      const result = Option.from(() => some(str));

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return None from Failure", () => {
      const result = Option.from(() => none(str));

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("pure", () => {
    it("should return Some from Success", () => {
      const result = Option.pure(some(str));

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should throw from Failure", () => {
      const result = () => Option.pure(none(str));

      expect(result).toThrowError();
    });
    it("should return none on null", () => {
      const result = Option.pure(definitelyNull());

      expect(result.isDefined()).toBe(false);
    });
    it("should return none on undefined", () => {
      const result = Option.pure(definitelyUndefined());

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("promiseOf", () => {
    it("should return Some from Success", async () => {
      const result = await Option.promiseOf(() => promiseSome(str));

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return None from Failure", async () => {
      const result = await Option.promiseOf(() => promiseNone(str));

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("promise", () => {
    it("should return Some from Success", async () => {
      const result = await Option.promise(promiseSome(str));

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return None from Failure", async () => {
      const result = await Option.promise(promiseNone(str));

      expect(result.isDefined()).toBe(false);
    });
    it("should return None from null", async () => {
      const result = await Option.promise(promiseDefinitelyNull());

      expect(result.isDefined()).toBe(false);
    });
    it("should return None from undefined", async () => {
      const result = await Option.promise(promiseDefinitelyUndefined());

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("map", () => {
    it("should return Some from Success", () => {
      const result = Option.pure(some(str)).map((x) => x);

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return None from Failure", () => {
      const result = Option.from(() => none(str)).map((x) => x);

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("flatMap", () => {
    it("should return Some from Success", () => {
      const result = Option.pure(some(str)).flatMap(Option.pure);

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return None from Failure", () => {
      const result = Option.from(() => none(str)).flatMap(Option.pure);

      expect(result.isDefined()).toBe(false);
    });
  });
  describe("fold", () => {
    it("should fold to Some", () => {
      const result = Option.pure(some(str)).fold(
        (x) => x,
        () => "none"
      );

      expect(result).toBe(str);
    });
    it("should fold to None", () => {
      const result = Option.from(() => none(str)).fold(
        (x) => x,
        () => "none"
      );

      expect(result).toBe("none");
    });
  });
  describe("flatten", () => {
    it("should return value on flatten Some", () => {
      const result = Option.pure(some(str)).flatten((x) => x);

      expect(result).toBe(str);
    });
    it("should throw on None", () => {
      const result = () => Option.from(() => none(str)).flatten((x) => x);

      expect(result).toThrowError();
    });
  });
  describe("orElse", () => {
    it("should return some on Success", () => {
      const result = Option.pure(some(str)).orElse(str);

      expect(result).toBe(str);
    });
    it("should return none on Failure", () => {
      const result = Option.from(() => none(str)).orElse("orElse");

      expect(result).toBe("orElse");
    });
  });
  describe("get()", () => {
    it("should throw on illegal get() call on none", () => {
      const result = () => Option.from(() => none(str)).get();

      expect(result).toThrowError();
    });
  });
});
