import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  maxConcurrency: 5,
  verbose: true,
  silent: false,
};

export default config;
