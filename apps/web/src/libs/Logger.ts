import type { AsyncSink } from '@logtape/logtape';
import {
  configure,
  fromAsyncSink,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger,
} from '@logtape/logtape';
import { env } from '@lmring/env';

const betterStackSink: AsyncSink = async (record) => {
  await fetch(`https://${env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN}`,
    },
    body: JSON.stringify(record),
  });
};

await configure({
  sinks: {
    console: getConsoleSink({ formatter: getJsonLinesFormatter() }),
    betterStack: fromAsyncSink(betterStackSink),
  },
  loggers: [
    { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
    {
      category: ['app'],
      sinks:
        env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN && env.NEXT_PUBLIC_BETTER_STACK_INGESTING_HOST
          ? ['console', 'betterStack']
          : ['console'],
      lowestLevel: 'debug',
    },
  ],
});

export const logger = getLogger(['app']);
