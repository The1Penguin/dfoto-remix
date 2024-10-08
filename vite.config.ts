import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import { denyImports, envOnlyMacros } from 'vite-env-only';
import { expressDevServer } from 'remix-express-dev-server';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals({ nativeFetch: true });

export default defineConfig({
	build: {
		target: 'esnext',
	},
	plugins: [
		expressDevServer(),
		denyImports({
			client: {
				files: ['**/lib/server/*', '**/.server/*', '**/*.server.*'],
			},
		}),
		envOnlyMacros(),
		//remixDevTools(),
		remix({
			future: {
				unstable_singleFetch: true,
				unstable_lazyRouteDiscovery: true,
				v3_relativeSplatPath: true,
				v3_fetcherPersist: true,
				v3_throwAbortReason: true,
			},
		}),
		tsconfigPaths(),
	],
});
