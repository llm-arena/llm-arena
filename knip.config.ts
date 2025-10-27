import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Monorepo workspace configuration
  workspaces: {
    '.': {
      // Root-level configuration
      ignore: ['**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**'],
      ignoreDependencies: ['turbo'], // Turbo is used via CLI
    },
    'apps/web': {
      // Web app specific configuration
      ignore: [
        'checkly.config.ts',
        'src/libs/I18n.ts',
        'src/types/I18n.ts',
        'src/utils/Helpers.ts',
        'tests/**/*.ts',
        'playwright.config.ts',
        'vitest.config.mts',
        'postcss.config.mjs',
        'commitlint.config.ts',
      ],
      ignoreDependencies: [
        '@commitlint/types',
        'conventional-changelog-conventionalcommits',
        'vite', // Used in vitest.config.mts
      ],
      ignoreBinaries: [
        'production', // False positive raised with dotenv-cli
      ],
    },
    'packages/database': {
      ignore: ['drizzle.config.ts', 'migrations/**/*'],
    },
    'packages/ui': {
      ignore: [],
    },
    'packages/auth': {
      // Auth package is a skeleton, ignore for now
      ignore: ['**/*'],
    },
    'packages/config/typescript-config': {
      ignore: ['**/*.json'],
    },
    'packages/config/biome-config': {
      ignore: ['biome.json'],
    },
    'packages/config/tailwind-config': {
      ignore: [],
    },
  },
  
  // Global ignores
  ignore: [
    '**/node_modules/**',
    '**/.turbo/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.config.js',
    '**/*.config.mjs',
  ],
  
  // Global compiler configuration
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};

export default config;
