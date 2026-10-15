import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        projects: [
            {
                test: { include: ['tests/**/*.test.js'], exclude: ['tests/dom/**'], environment: 'node' },
            },
            {
                test: { include: ['tests/dom/**/*.test.js'], environment: 'jsdom' },
            },
        ],
    },
});
