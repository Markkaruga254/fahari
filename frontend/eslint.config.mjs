// Minimal flat config: ESLint JS recommended + typescript-eslint flat recommended.
// @typescript-eslint/* currently resolves as hoisted transitive deps of
// eslint-config-next. If a fresh install ever stops hoisting them, promote
// "@typescript-eslint/eslint-plugin" to a direct devDependency.
// Next-specific rules (eslint-plugin-next) are a post-hackathon task:
// eslint-config-next ships legacy eslintrc configs only, and its plugin is
// not installed, so the next/core-web-vitals preset is not usable here.
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  js.configs.recommended,
  ...tsPlugin.configs["flat/recommended"],
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**"],
  },
];
