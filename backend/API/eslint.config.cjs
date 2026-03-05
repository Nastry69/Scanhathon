const js = require("@eslint/js");
const security = require("eslint-plugin-security");

const nodeGlobals = {
  require: "readonly",
  module: "readonly",
  exports: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  process: "readonly",
  console: "readonly",
  Buffer: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
};

module.exports = [
  // Exclure les fichiers frontend et de config qui utilisent les ES modules
  {
    ignores: ["src/**", "*.config.js", "vite.config.*"],
  },
  // Fichiers JS : détection automatique CommonJS vs ES modules
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 2021,
      sourceType: "unambiguous",
      globals: {
        ...js.configs.recommended.languageOptions?.globals,
        ...nodeGlobals,
      },
    },
  },
  security.configs.recommended,
];
