
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';

import { GithubAgent } from './agents';

export const mastra = new Mastra({
  agents: { GithubAgent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
