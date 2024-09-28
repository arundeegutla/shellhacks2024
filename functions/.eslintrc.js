module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    // "@typescript-eslint",
    "import",
  ],
  rules: {
    // Disable all rules
    '*': 'off',
  },
};
