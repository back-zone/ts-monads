import { Failure, IO } from "../src/io";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

const expectedTodo: Todo = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};

const todoBuilder = (json: any): Todo => {
  return {
    userId: json.userId,
    id: json.id,
    title: json.title,
    completed: json.completed,
  };
};

const makeCall = async <A>(
  url: string,
  builder: (_: any) => A
): Promise<IO<A>> => {
  return IO.promiseOf(
    async () =>
      await fetch(url)
        .then((r) => r.json())
        .then((json) => builder(json))
  );
};

const num: number = 1;
const str: string = "str";
const date: Date = new Date();
const obj: object = { a: 1, b: 2 };
const success = (): string => "success";
const success2 = (str: string): string => str;
const failure = (): Error => new Error("failure");
const failure2 = (str: string): Error => new Error(str);
const throwFailure = (): void => {
  throw new Error("throws");
};
const throwfailure2 = (str: string): string => {
  throw new Error(str);
};
const promise: Promise<string> = Promise.resolve("success");
const orElseFailure = (str: string): string => {
  throw new Failure(new Error(str));
};
const promiseSuccess = (): Promise<string> => Promise.resolve("success");
const promiseSuccess2 = (str: string): Promise<string> => Promise.resolve(str);
const promiseNull = async (str: string): Promise<string | null> =>
  Promise.resolve(null);
const promiseFailure = (): Promise<Error> =>
  Promise.reject(new Error("failure"));
const promiseThrowFailure = (): Promise<void> => {
  throw new Error("throws");
};

describe("IO", () => {
  describe("from", () => {
    it("should return a Success from a function that returns a value", () => {
      const result = IO.from(success);
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe("success");
    });
    it("should return a Success from a parameterized function that returns a value", () => {
      const result = IO.pure(success2(str));
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return a Failure from a function that returns an error", () => {
      const result = IO.from(failure);
      expect(result.isSuccess()).toBe(false);
      expect(result.error().message).toBe("failure");
    });
    it("should return a Failure from a parameterized function that returns an error", () => {
      const result = IO.pure(failure2(str));
      expect(result.isSuccess()).toBe(false);
      expect(result.error().message).toBe(str);
    });
    it("should return a Failure from a function that throws", () => {
      const result = IO.from(throwFailure);
      expect(result.isSuccess()).toBe(false);
      expect(result.error().message).toBe("throws");
    });
    it("should return a Failure from a parameterized function that throws", () => {
      const result = IO.from(() => throwfailure2(str));
      expect(result.isSuccess()).toBe(false);
      expect(result.error().message).toBe(str);
    });
    it("should return a Faliure on null value", () => {
      const result = IO.from(() => null);

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).not.toBeNull();
    });
  });

  describe("pure", () => {
    it("should return a Success from a number value", () => {
      const result = IO.pure(num);
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(num);
    });
    it("should return a Success from a string value", () => {
      const result = IO.pure(str);
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should return a Success from a date value", () => {
      const result = IO.pure(date);
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(date);
    });
    it("should return a Success from an object value", () => {
      const result = IO.pure(obj);
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(obj);
    });
  });

  describe("promise/promiseOf", () => {
    it("should return Failure from a failure promise function call", async () => {
      const result = await IO.promiseOf(promiseFailure);

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).toStrictEqual(new Error("failure"));
    });
    it("should return Failure from a failed promise function call", async () => {
      const result = await IO.promiseOf(promiseThrowFailure);

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).toStrictEqual(new Error("throws"));
    });
    it("should return Success from an promise value call", async () => {
      const result = await IO.promise(promise);

      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe("success");
    });
    it("should return Success from an promise function call", async () => {
      const result = await IO.promise(promiseSuccess2(str));
      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(str);
    });
    it("should flatten Success from an other IO function call", async () => {
      const resultOne = await IO.promise(promiseSuccess2(str));
      const resultTwo = await resultOne.flatten((r) =>
        IO.promise(promiseSuccess2(r))
      );

      expect(resultTwo.isSuccess()).toBe(true);
      expect(resultTwo.get()).toBe(resultOne.get());
    });
    it("should return a Faliure from an Error result", async () => {
      const result = await IO.promiseOf(() =>
        Promise.resolve(new Error("error"))
      );

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).not.toBeNull();
    });
    it("should return a Failure from a null result", async () => {
      const result = await IO.promiseOf(() => promiseNull(str));

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).toStrictEqual(new Error("null/undefined"));
    });
    it("RW: should combine successful call of a previous fetch IO and then return Todo", async () => {
      const result = await makeCall(
        "https://jsonplaceholder.typicode.com/todos/1",
        todoBuilder
      );

      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toStrictEqual(expectedTodo);
    });
    it("RW: should fail on an invalid url", async () => {
      const result = await makeCall("invalid-url", todoBuilder);

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).not.toBeNull();
    });
  });

  describe("map", () => {
    it("should map a successfully executed IO operation to an other", () => {
      var result = IO.pure(success2("1")).map(parseInt);

      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(1);
    });
    it("should fail on mapping an fault IO operation", () => {
      var result = IO.pure(success2("asd"))
        .map((x) => Number(x))
        .map((n) => {
          if (Number.isNaN(n)) {
            throw new Error("invalid int");
          }

          return n;
        })
        .map((n) => n);

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).not.toBeNull();
    });
  });

  describe("flatMap", () => {
    it("should handle an successful IO", () => {
      var result = IO.pure(success2("1"))
        .flatMap((n) => IO.pure(Number(n)))
        .flatMap((n) => {
          if (Number.isNaN(n)) {
            return Failure.of(new Error("invalid int"));
          }

          return IO.pure(n);
        });

      expect(result.isSuccess()).toBe(true);
      expect(result.get()).toBe(1);
    });

    it("should fail on an faulty IO", () => {
      var result = IO.pure(new Error()).flatMap((n) => IO.pure(n));

      expect(result.isSuccess()).toBe(false);
      expect(result.error()).not.toBeNull();
    });
  });

  describe("fold", () => {
    it("should successfully fold to a string after an successful IO", () => {
      const handleError = (e: Error) => {
        return e.message;
      };

      const handleSuccess = (args: string) => args;

      const result = IO.pure("success").fold(handleSuccess, handleError);

      expect(result).toBe("success");
    });

    it("should failed to fold to a string after an faulty IO", () => {
      const handleError = (e: Error): string => {
        return e.message;
      };

      const result = IO.from(() => throwfailure2("failure")).fold(
        (x) => x,
        handleError
      );

      expect(result).toBe("failure");
    });
  });

  describe("flatten", () => {
    it("should flatten on a Success", () => {
      const result = IO.pure(str).flatten((x) => x);

      expect(result).not.toBeNull();
      expect(result).toStrictEqual(str);
    });
    it("should throw an Error on a Failure", () => {
      const result = () => IO.pure(new Error(str)).flatten((x) => x);

      expect(result).toThrowError();
    });
  });

  describe("orElse", () => {
    it("should return original value on Success", () => {
      const result = IO.pure(str).orElse("else");

      expect(result).toStrictEqual(str);
    });
    it("should return alter value on Failure", () => {
      const result = IO.from(() => orElseFailure(str)).orElse("else");

      expect(result).toStrictEqual("else");
    });
  });

  describe("mapError", () => {
    it("should return original value on Success", () => {
      const result = IO.pure(success2(str)).mapError((x) => x.message);

      expect(result).toStrictEqual(str);
    });

    it("should return mapped value on Failure", () => {
      const result = IO.from(() => orElseFailure(str)).mapError(
        (e) => e.message
      );

      expect(result).toStrictEqual("Unknown error");
    });
  });

  describe("toEither", () => {
    it("should return Right on Success", () => {
      const result = IO.pure(success2(str)).toEither();

      expect(result.isLeft()).toBe(false);
      expect(result.right()).toBe(str);
    });

    it("should return Left on Failure", () => {
      const result = IO.from(() => orElseFailure(str)).toEither();

      expect(result.isLeft()).toBe(true);
      expect(result.left()).not.toBeNull();
    });
  });

  describe("toOption", () => {
    it("should return Some on Success", () => {
      const result = IO.pure(success2(str)).toOption();

      expect(result.isDefined()).toBe(true);
      expect(result.get()).toBe(str);
    });

    it("should return NOne on Failure", () => {
      const result = IO.from(() => orElseFailure(str)).toOption();

      expect(result.isDefined()).toBe(false);
    });
  });

  describe("get()", () => {
    it("should throw on illegal get() call on Failure", () => {
      const result = () => IO.pure(new Error(str)).get();

      expect(result).toThrowError();
    });
    it("should throw on illegal get() call on Success", () => {
      const result = () => IO.pure(str).error();

      expect(result).toThrowError();
    });
  });
});
