module.exports = {
    env: {
        es6: true,
        node: true,
        browser: true
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: [
        'prettier',
        '@typescript-eslint',
        'import'
    ],
    extends: [
        'eslint:recommended',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    rules: {
        'prettier/prettier': 'error',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                'ts': 'never'
            }
        ],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-console': 'off',
        'sort-imports': [
            'error',
            {
                'ignoreCase': false,
                'ignoreDeclarationSort': false,
                'ignoreMemberSort': false,
                'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
                'allowSeparatedGroups': false
            }
        ]
    },
    settings: {
        'import/resolver': {
            'typescript': {}
        }
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
            ],
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },
    ],
};