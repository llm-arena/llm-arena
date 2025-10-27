/**
 * PostCSS Configuration
 * @type {import('postcss-load-config').Config}
 *
 * This file imports the shared PostCSS configuration from the monorepo's
 * @lmring/tailwind-config package to ensure consistent Tailwind CSS processing.
 */
import { postcssConfig } from '@lmring/tailwind-config/postcss';

export default postcssConfig;
