import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';
import { Env } from './src/libs/Env';

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: true,
};

const emailChannel = new EmailAlertChannel('email-channel-1', {
  address: Env.CHECKLY_EMAIL_ADDRESS ?? '',
  ...sendDefaults,
});

export const config = defineConfig({
  projectName: Env.CHECKLY_PROJECT_NAME ?? '',
  logicalId: Env.CHECKLY_LOGICAL_ID ?? '',
  repoUrl: 'https://github.com/lmring/lmring',
  checks: {
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['website'],
    runtimeId: '2024.02',
    browserChecks: {
      frequency: Frequency.EVERY_24H,
      testMatch: '**/tests/e2e/**/*.check.e2e.ts',
      alertChannels: [emailChannel],
    },
    playwrightConfig: {
      use: {
        baseURL: Env.ENVIRONMENT_URL || Env.NEXT_PUBLIC_APP_URL,
        extraHTTPHeaders: {
          'x-vercel-protection-bypass': Env.VERCEL_BYPASS_TOKEN,
        },
      },
    },
  },
  cli: {
    runLocation: 'us-east-1',
    reporters: ['list'],
  },
});

export default config;
