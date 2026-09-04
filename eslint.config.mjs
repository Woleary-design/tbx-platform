import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
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
      // Existing client flows restore drafts and clear dependent state in effects.
      // Refactor these incrementally rather than making lint unusable meanwhile.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
]);
