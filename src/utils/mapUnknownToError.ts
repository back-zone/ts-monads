export const buildError = (error: unknown): Error => mapUnknownToError(error);

const mapUnknownToError = (error: unknown): Error => {
  if (typeof error === "string") {
    return new Error(error);
  } else if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown error");
};

export default mapUnknownToError;
