import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { plugin as shadcn } from "@shadcn/lint";

const config = [
  {
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "prisma/generated/**",
      "tests-examples/**",
    ],
  },
  ...tsPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    // All authored JS/TS source, not just the shared primitive implementation.
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    settings: {
      shadcn: {
        // Recognize every custom component module, including local sibling
        // imports, alongside the alias and relative shared-primitive imports.
        componentImports: [
          "^components(?:/|$)",
          "^(?:\\.{1,2}/)+components(?:/|$)",
          "^(?:\\.{1,2}/)+ui$",
          "^\\./[^/]+$",
        ],
        note: "Use this app's semantic tokens.",
      },
    },
    rules: {
      // Full strict audit: every rule exported by @shadcn/lint 0.2.5 is an
      // error. No file-scoped allowances, readiness hooks, or blur exceptions.
      "shadcn/no-restyle": "error",
      "shadcn/no-raw-colors": ["error", { scanAllStrings: true }],
      "shadcn/no-arbitrary-values": ["error", { scanAllStrings: true }],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
