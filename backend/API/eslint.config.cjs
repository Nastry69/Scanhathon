const js = require("@eslint/js");
const security = require("eslint-plugin-security");

module.exports = [
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...js.configs.recommended.languageOptions?.globals,
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly"
      }
    }
  },
  security.configs.recommended
];
