import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { remixDevTools } from 'remix-development-tools';

installGlobals({ nativeFetch: true });

export default defineConfig({
  build: {
    target: 'ES2022',
  },
  plugins: [
    remixDevTools(),
    remix({
      future: {
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
});
