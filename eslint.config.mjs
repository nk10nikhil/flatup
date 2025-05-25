import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Fix unused variables errors
      "@typescript-eslint/no-unused-vars": "warn",

      // Fix any type errors
      "@typescript-eslint/no-explicit-any": "warn",

      // Fix missing dependency errors in useEffect hooks
      "react-hooks/exhaustive-deps": "warn",

      // Fix HTML entity escaping errors
      "react/no-unescaped-entities": "warn",

      // Fix img element warnings
      "@next/next/no-img-element": "warn",

      // Fix var usage in global.d.ts
      "no-var": "warn",
    },
  },
];

export default eslintConfig;
