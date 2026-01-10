export default [
  // Base config for project files
  {
    linterOptions: {
      // don't fail due to unused eslint-disable directives (configure as needed)
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    // Use Next.js recommended config
    extends: ['next/core-web-vitals'],
  },
];
