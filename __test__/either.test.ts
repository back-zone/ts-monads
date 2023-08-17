import { Either } from "../src/either";

const str = "str";
const right = (str: string) => str;
const left = (str: string): string => {
  throw new Error(str);
};
const promiseLeft = async (str: string): Promise<string> => {
  throw new Error(str);
};
const promiseRight = async (str: string): Promise<string> =>
  await Promise.resolve(str);

describe("either", () => {
  describe("from", () => {
    it("should return Right on Success", () => {
      const result = Either.from(() => right(str));

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });
    it("should return Left on Failure", () => {
      const result = Either.from(() => left(str));

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("pure", () => {
    it("should return right on Success", () => {
      const result = Either.pure(str);

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });

    it("should return Left on Failure", () => {
      const result = Either.pure(new Error(str));

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("promiseOf", () => {
    it("should return Right on Success", async () => {
      const result = await Either.promiseOf(() => promiseRight(str));

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });
    it("should return Left on Failure", async () => {
      const result = await Either.promiseOf(() => promiseLeft(str));

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("promise", () => {
    it("should return Right on Success", async () => {
      const result = await Either.promise(promiseRight(str));

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });
    it("should return Left on Failure", async () => {
      const result = await Either.promise(promiseLeft(str));

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("map", () => {
    it("should return Right on Success", () => {
      const result = Either.pure(right(str)).map((x) => x);

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });
    it("should return Left on Failure", () => {
      const result = Either.from(() => left(str)).map((x) => x);

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("flatMap", () => {
    it("should return Right on Success", () => {
      const result = Either.pure(right(str)).flatMap((x) => Either.pure(x));

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });
    it("should return Left on Failure", () => {
      const result = Either.from(() => left(str)).flatMap((x) =>
        Either.pure(x)
      );

      expect(result.isLeft()).toBe(true);
      expect(result.left()).toStrictEqual(new Error(str));
    });
  });
  describe("fold", () => {
    it("should fold to Right", () => {
      const result = Either.pure(right(str)).fold(
        (s) => s,
        (e) => e.message
      );

      expect(result).toBe(str);
    });
    it("should fold to Left", () => {
      const result = Either.from(() => left(str)).fold(
        (s) => s,
        (e) => e.message
      );

      expect(result).toBe(str);
    });
  });
  describe("flatten", () => {
    it("should return value on flatten Right", () => {
      const result = Either.pure(right(str)).flatten((x) => x);

      expect(result).toBe(str);
    });
    it("should throw on Left", () => {
      const result = () => Either.from(() => left(str)).flatten((x) => x);

      expect(result).toThrowError();
    });
  });
  describe("orElse", () => {
    it("should return Right value on Success", () => {
      const result = Either.pure(right(str)).orElse(str);

      expect(result).toBe(str);
    });
    it("should return Left value on Failure", () => {
      const result = Either.from(() => left(str)).orElse("orElse");

      expect(result).toBe("orElse");
    });
  });
  describe("mapLeft", () => {
    it("should map on Left", () => {
      const result = Either.from(() => left(str)).mapLeft((x) => x.message);

      expect(result.left()).toBe(str);
    });
    it("should map on Left without touching right", () => {
      const result = Either.pure(right(str)).mapLeft((x) => x.message);

      expect(result.right()).toBe(str);
    });
  });
  describe("get()", () => {
    it("should throw on illegal get() call on Right", () => {
      const result = () => Either.from(() => left(str)).right();

      expect(result).toThrowError();
    });
    it("should throw on illegal get() call on Left", () => {
      const result = () => Either.pure(right(str)).left();

      expect(result).toThrowError();
    });
  });
});
