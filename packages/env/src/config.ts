import { config } from 'dotenv';
import { findUpSync } from 'find-up-simple';
import * as path from 'node:path';

// Find project root by looking for pnpm-workspace.yaml
const workspaceRoot = findUpSync('pnpm-workspace.yaml', {
  cwd: process.cwd(),
  type: 'file',
});

if (!workspaceRoot) {
  throw new Error(
    'Could not find pnpm-workspace.yaml. Are you in a pnpm workspace?',
  );
}

const projectRoot = path.dirname(workspaceRoot);

// Load .env file from project root
config({ path: path.join(projectRoot, '.env') });
