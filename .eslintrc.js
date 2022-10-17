module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
    'prettier',
  ],
  ignorePatterns: [
    'public',
    'node_modules',
    '.eslintrc.js',
    'webpack.*',
    'src/js/vendors/*',
    'src/mockServer/*',
  ],
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  rules: {
    // override/add rules settings here, such as:
    'prefer-template': 1,
    'prefer-const': 1,
    'no-var': 1,
    'no-unused-vars': 1,
    camelcase: 1,
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
    'spaced-comment': ['error', 'always'],
  },
}
