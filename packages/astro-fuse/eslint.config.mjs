import pluginJs from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  // Generated test-fixture artifacts (Astro types, build output) and tsup's
  // transient bundled-config file (created/removed mid-build; linting it
  // races with `turbo run build lint` and fails with ENOENT).
  { ignores: ['**/.astro/**', '**/dist/**', '**/tsup.config.bundled_*.mjs'] },
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  perfectionist.configs['recommended-alphabetical'],
  eslintPluginPrettierRecommended,
]
