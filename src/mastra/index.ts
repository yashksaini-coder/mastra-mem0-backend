
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { GithubAgent, EmailAgent, editorAgent, mem0Agent } from './agents';
import mem0Workflow from './workflows/index';
export const mastra = new Mastra({
  agents: { GithubAgent, EmailAgent, editorAgent, mem0Agent },
  workflows: { mem0Workflow },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});


