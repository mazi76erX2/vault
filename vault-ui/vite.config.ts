import {searchForWorkspaceRoot} from 'vite';
import {configDefaults, defineConfig} from 'vitest/config';

const externals = [
    'react-color/lib/components/common',
    'tinycolor2',
    '@fontsource/lato',
    'react-color'
].map((e) => `node_modules/generic-components/node_modules/${e}`);
// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        exclude: externals
    },
    plugins: [
        // react(),
        // commonjsExternals({
        //     externals,
        // }),
    ],
    server: {
        host: true,
        port: 8081,
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd()),
                '../../generic-components',
                ...externals
            ]
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: 'src/setup.tsx',
        silent: true,
        reporters: ['verbose', 'html'],
        coverage: {
            provider: 'v8',
            reporter: ['html'],
            exclude: [
                ...configDefaults.exclude,
                './vite.local.config.ts',
                './html/**',
                './coverage/**'
            ]
        }
    }
});
