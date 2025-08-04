import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'nodemodules'],
  },
  {
    files: ['*/.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 'any' 타입 사용을 '오류(error)'가 아닌 '경고(warn)'로 처리
      '@typescript-eslint/no-explicit-any': 'warn',
      // 사용되지 않는 변수를 '오류'가 아닌 '경고'로 처리하며, '_'로 시작하는 변수는 무시
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^', varsIgnorePattern: '^', caughtErrorsIgnorePattern: '^' },
      ],
      // 변수가 재할당되지 않는 경우 'let' 대신 'const' 사용을 '경고'로 권장
      '@typescript-eslint/prefer-const': 'warn',
      // non-null assertion (!) 사용을 '경고'하여 타입 안전성을 해치는 위험성 인지 유도
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // console.log 같은 디버깅 코드를 '경고'로 처리하고, console.warn/error는 허용
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // 'var' 키워드 사용을 완전히 '오류'로 금지
      'no-var': 'error',

      // Vite의 Fast Refresh를 위해 컴포넌트 export 방식을 '경고'로 처리
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);
