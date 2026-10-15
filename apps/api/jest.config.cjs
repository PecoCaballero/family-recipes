/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api',
  testEnvironment: 'node',
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@family-recipe/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
};
