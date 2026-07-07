import path from 'node:path';
import {loadEnv} from 'vite';
import {defineConfig, type Plugin} from 'vitest/config';
import react from '@vitejs/plugin-react';
import sirv from 'sirv';

function fixturesPlugin(enabled: boolean): Plugin {
  return {
    name: 'polyglit-fixtures',
    configureServer(server) {
      if (!enabled) return;
      const fixturesRoot = path.resolve(process.cwd(), '../fixtures');
      server.middlewares.use('/fixtures', sirv(fixturesRoot, {dev: true, etag: true}));
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const fixturesEnabled =
    String(env.REACT_APP_USE_FIXTURES_FLAG ?? '').trim().toLowerCase() === 'true';

  return {
    plugins: [react(), fixturesPlugin(fixturesEnabled)],
    envPrefix: ['VITE_', 'REACT_APP_'],
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
});
