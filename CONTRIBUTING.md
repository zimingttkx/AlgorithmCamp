# Contributing to AlgorithmCamp

## Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd app && npm install
   ```
3. Copy environment files:
   ```bash
   cp app/.env.example app/.env
   cp server/.env.example server/.env
   ```
4. Start MongoDB locally

## Development

```bash
# Frontend dev server at localhost:5173
cd app && npm run dev

# Backend server (separate terminal)
cd server && npm run dev
```

## Testing

```bash
# Unit tests
cd app && npm test

# E2E tests
cd app && npx playwright test
```

## Pull Requests

1. Follow conventional commits format (`feat:`, `fix:`, `docs:`, etc.)
2. Ensure tests pass
3. Update documentation if needed
4. Keep code clean and well-organized

## Code Style

- Use ESLint for JavaScript/Vue linting
- Use Prettier for code formatting
- Follow Vue 3 Composition API best practices
