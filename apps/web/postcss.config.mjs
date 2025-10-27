/**
 * PostCSS Configuration
 * @type {import('postcss-load-config').Config}
 *
 * This file imports the shared PostCSS configuration from the monorepo's
 * @model-arena/tailwind-config package to ensure consistent Tailwind CSS processing.
 */
import { postcssConfig } from '@model-arena/tailwind-config/postcss';

export default postcssConfig;
