import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import prettier from 'eslint-config-prettier';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        SVGCircleElement: 'readonly',
        SVGSVGElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        Touch: 'readonly',
        DOMRect: 'readonly',
        Element: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: {
      vue,
    },
    ...vue.configs['vue3-recommended'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        SVGCircleElement: 'readonly',
        SVGSVGElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        Touch: 'readonly',
        DOMRect: 'readonly',
        Element: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  prettier,
  {
    files: ['**/*.{js,vue,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        node: true,
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        SVGCircleElement: 'readonly',
        SVGSVGElement: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        Touch: 'readonly',
        DOMRect: 'readonly',
        Element: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      // Add any custom rules here
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
]; 