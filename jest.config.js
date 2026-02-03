module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@core/base/base.service$': '<rootDir>/api/pitchdeck/__mocks__/base.service.ts',
    '^file-type$': '<rootDir>/api/pitchdeck/__mocks__/file-type.ts',
    '^uuid$': '<rootDir>/api/pitchdeck/__mocks__/uuid.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/__mocks__/jest.setup.js'],
};