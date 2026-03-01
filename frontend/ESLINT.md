# ESLint и Prettier настройка

## Установка зависимостей

```bash
cd frontend
npm install --save-dev eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
```

## Конфигурация ESLint (.eslintrc.json)

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Конфигурация Prettier (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Scripts в package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}