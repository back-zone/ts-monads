import mapUnknownToError, { buildError } from "../src/utils/mapUnknownToError";

const error = new Error("test");
const unknownError: unknown = new Error("test");
const anyError: any = new Error("test");
const failedToBuildError: Error = new Error("Unknown error");

describe("Utils", () => {
  describe("buildError", () => {
    it("should build Error from string", () => {
      expect(buildError(error.message)).toEqual(error);
    });
    it("should build Error from any", () => {
      expect(buildError(anyError)).toEqual(error);
    });
    it("should build Error from unknown", () => {
      expect(buildError(unknownError)).toEqual(error);
    });
    it("should build Error from Error", () => {
      expect(buildError(error)).toEqual(error);
    });
    it("should fail on invalid input", () => {
      expect(buildError(null)).toEqual(failedToBuildError);
      expect(buildError(undefined)).toEqual(failedToBuildError);
      expect(buildError(0)).toEqual(failedToBuildError);
      expect(buildError(new Date())).toEqual(failedToBuildError);
    });
  });

  describe("mapUnknownToError", () => {
    it("should build Error from string", () => {
      expect(mapUnknownToError(error.message)).toEqual(error);
    });
    it("should build Error from any", () => {
      expect(mapUnknownToError(anyError)).toEqual(error);
    });
    it("should build Error from unknown", () => {
      expect(mapUnknownToError(unknownError)).toEqual(error);
    });
    it("should build Error from Error", () => {
      expect(mapUnknownToError(error)).toEqual(error);
    });
    it("should fail on invalid input", () => {
      expect(mapUnknownToError(null)).toEqual(failedToBuildError);
      expect(mapUnknownToError(undefined)).toEqual(failedToBuildError);
      expect(mapUnknownToError(0)).toEqual(failedToBuildError);
      expect(mapUnknownToError(new Date())).toEqual(failedToBuildError);
    });
  });
});
