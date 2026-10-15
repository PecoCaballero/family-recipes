/** @type {import('jest').Config} */
module.exports = {
  displayName: 'web',
  testEnvironment: 'jsdom',
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.spec.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@family-recipe/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
