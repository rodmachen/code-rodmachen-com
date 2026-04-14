import next from 'eslint-config-next/core-web-vitals';

const config = [
  ...next,
  {
    ignores: ['.velite/**', 'test-results/**', 'playwright-report/**'],
  },
];

export default config;
