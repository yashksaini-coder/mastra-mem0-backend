
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { GithubAgent, EmailAgent, editorAgent } from './agents';
import { mem0Workflow } from './workflows';
export const mastra = new Mastra({
  agents: { GithubAgent, EmailAgent, editorAgent },
  workflows: { mem0Workflow },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});


