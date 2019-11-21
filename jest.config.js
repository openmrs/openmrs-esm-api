module.exports = {
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  },
  moduleNameMapper: {
    "lodash-es": "lodash",
    "@openmrs/esm-error-handling":
      "<rootDir>/__mocks__/openmrs-esm-error-handling.mock.ts",
    "@openmrs/esm-module-config":
      "<rootDir>/__mocks__/openmrs-esm-module-config.mock.ts",
    "single-spa": "<rootDir>/__mocks__/single-spa.mock.ts"
  }
};
