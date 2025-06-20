import {configDefaults, defineConfig} from 'vitest/config';
//import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        chunkSizeWarningLimit: 100,
        rollupOptions: {
            onwarn(warning, warn) {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            }
        }
    },
    // plugins: [react()],
    optimizeDeps: {
        // include: ['@emotion/react', '@emotion/styled']
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
                './index.ts',
                './server.js',
                './html/**',
                './coverage/**',
                './.storybook/**',
                './storybook-static/**',
                './src/Demos/**',
                './src/**/*.stories.{tsx,ts}'
            ]
        }
    },

});
