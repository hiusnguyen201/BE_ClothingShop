/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest.js', 'jest-extended/all'],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    '^.+\\.jsx?$': 'babel-jest',
  },

  transformIgnorePatterns: ['<rootDir>/node_modules/(?!escape-string-regexp)'],

  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  forceExit: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  verbose: true,

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/src/app/**/?(*.)+(spec|test).[jt]s?(x)'],
};

export default config;
