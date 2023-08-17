export type FunctionParameter<
  FArgs extends any[] | void,
  FResult
> = FArgs extends [...any] ? (...args: FArgs) => FResult : () => FResult;
