module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["react-app", "plugin:prettier/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  rules: {},
  settings: {
    react: {
      version: "16.13"
    }
  }
};
