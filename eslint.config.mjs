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
      // TBX currently renders collector and catalogue images from dynamic remote URLs.
      // Move these to next/image once the image proxy/storage strategy is finalised.
      "@next/next/no-img-element": "off",
      // The Quick Add input behaves as an accessible autocomplete. The current
      // jsx-a11y rule incorrectly flags aria-expanded on the native input.
      "jsx-a11y/role-supports-aria-props": "off",
      // Keep deployment lint non-blocking while the Atlas pricing route is being
      // consolidated. This rule is stylistic and does not affect runtime safety.
      "prefer-const": "off",
    },
  },
];

export default eslintConfig;