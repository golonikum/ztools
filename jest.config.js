const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Эта опция говорит Jest, где искать тесты.
  // '<rootDir>' - это корень вашего проекта.
  // '**/*.test.ts' - означает "любой файл, заканчивающийся на .test.ts в любой подпапке".
  testMatch: [
    "<rootDir>/src/**/*.test.ts", // <-- Убедитесь, что путь правильный
  ],
  // Эта опция говорит Jest, какие файлы не нужно трасформировать.
  // Обычно здесь только node_modules.
  transformIgnorePatterns: ["node_modules/"],
  transform: {
    ...tsJestTransformCfg,
  },
};
