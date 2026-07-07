# Polyglit

Frontend for [Le Petit Prince in Lots of Languages](https://lepetitprince.international) and related book troves. Built with [React](https://react.dev/) and [Vite](https://vite.dev/).

## Getting started

From the `frontend/` directory:

```bash
npm install
npm start
```

The dev server runs at [http://localhost:3000](http://localhost:3000). Which trove data loads depends on `REACT_APP_*` environment variables (see `../envrc-template` or `../DEVELOPERS.md`).

With `REACT_APP_USE_FIXTURES_FLAG=true`, trove JSON is served from `../fixtures` instead of S3.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Vite dev server (port 3000) |
| `npm run build` | Production build to `dist/` |
| `npm run build:deploy` | Build using values from `.env.deploy` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Build for GitHub Pages and publish to `gh-pages` |

`npm run deploy` uses `build:deploy` and `.env.deploy`, not your shell-only variables. See [DEVELOPERS.md](../DEVELOPERS.md) for environment variables, fixtures, and deployment details.

## Project layout

- `index.html` — Vite entry HTML
- `public/` — Static assets copied as-is into the build
- `src/` — Application source
- `vite.config.ts` — Vite and Vitest configuration
