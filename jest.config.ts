import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["<rootDir>/src/__tests__/**/*.test.(ts|tsx)"],
    testPathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/.next/",
        "<rootDir>/src/__tests__/e2e",
    ],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

export default createJestConfig(customJestConfig);
