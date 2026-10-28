import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import nx from '@nx/eslint-plugin';
import security from 'eslint-plugin-security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/.next/**',
      '**/dist/**',
      '**/tmp/**',
      '**/coverage/**',
      '**/node_modules/**',
      '.nx/**',
      '.yarn/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { '@nx': nx },
    rules: {
      // Arch fitness: enforce module boundaries between projects.
      // Apps may only depend on libs; scopes may only depend on themselves + shared.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },
            { sourceTag: 'type:lib', onlyDependOnLibsWithTags: ['type:lib'] },
            { sourceTag: 'scope:web', onlyDependOnLibsWithTags: ['scope:web', 'scope:shared'] },
            { sourceTag: 'scope:api', onlyDependOnLibsWithTags: ['scope:api', 'scope:shared'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Security guardrails for the API. These catch the classes of defect that
    // shipped in the MVP launch (TLS verification disabled, path traversal
    // from client-supplied filenames, unsafe dynamic execution) so they fail
    // lint instead of reaching production.
    files: ['apps/api/**/*.ts', 'apps/api/**/*.tsx'],
    plugins: { security },
    rules: {
      'security/detect-eval-with-expression': 'error',
      'security/detect-child-process': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name='rejectUnauthorized'][value.value=false]",
          message: 'Do not disable TLS certificate verification.',
        },
        {
          selector: "MemberExpression[property.name='originalname']",
          message:
            'Do not derive stored filenames from the client-supplied originalname; use a server-side allowlist.',
        },
      ],
    },
  },
];

export default eslintConfig;
