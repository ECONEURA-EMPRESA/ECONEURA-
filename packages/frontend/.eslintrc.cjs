module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  globals: {
    Image: 'readonly',
    FormData: 'readonly',
    EventSource: 'readonly',
    SpeechRecognition: 'readonly',
    SpeechSynthesisVoice: 'readonly',
    webkitSpeechRecognition: 'readonly'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-undef': 'error',
    'no-redeclare': 'error'
  },
};
