import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        projects: [
            {
                test: { include: ['tests/**/*.test.js'], environment: 'node' },
            },
            {
                test: { include: ['tests/dom/**/*.test.js'], environment: 'jsdom' },
            },
        ],
    },
});
