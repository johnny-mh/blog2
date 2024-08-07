/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
}

export default config
