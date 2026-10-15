import jsConfig from '@notmike101/eslint-config-js';
import jsdocConfig from '@notmike101/eslint-config-jsdoc';

export default [
    {
        ignores: ['dist/**', 'vendor/**', '.scratch/**', '.worktrees/**'],
    },
    ...jsConfig,
    ...jsdocConfig,
];
