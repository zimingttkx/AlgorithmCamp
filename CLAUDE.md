# AlgorithmCamp

A Vue 3 + Vite algorithm practice platform with dark neon theme and pixel-art UI.

## Tech Stack

- **Frontend**: Vue 3, Vite, Vue Router
- **Backend**: Express.js, MongoDB
- **Build**: GitHub Actions, GitHub Pages

## Key Architecture

- SPA at `/AlgorithmCamp/` base path (GitHub Pages)
- 12 algorithm chapters in `app/public/docs/`
- Progress sync between localStorage and MongoDB
- GitHub-style contribution calendar
- Three.js 3D practice map visualization

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm test` - Run unit tests
- `npx playwright test` - Run E2E tests

## API

- Backend API at `/api/*`
- Authentication via JWT tokens
- Progress sync with conflict resolution
