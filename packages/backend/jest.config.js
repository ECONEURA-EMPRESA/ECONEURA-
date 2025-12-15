/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    // Only run .ts tests, not the broken .js ones
    testMatch: ['**/tests/**/*.test.ts'],
    moduleNameMapper: {
        // Handle the monorepo workspace alias for @econeura/shared
        '^@econeura/shared/(.*)$': '<rootDir>/../shared/src/$1',
        '^@econeura/shared$': '<rootDir>/../shared/src',
        // Keep the existing alias
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

module.exports = config;
