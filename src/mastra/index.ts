
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { GithubAgent, EmailAgent, editorAgent, mem0Agent } from './agents';
import mem0Workflow from './workflows/index';
import { VercelDeployer } from '@mastra/deployer-vercel';
export const mastra = new Mastra({
  agents: { GithubAgent, EmailAgent, editorAgent, mem0Agent },
  workflows: { mem0Workflow },
  deployer: new VercelDeployer({
    teamSlug: 'yash-kumar-sainis-projects',
    projectName: 'mem0-mastra-backend',
    token: 'KtEjUieZeke3A0MtgxDQLtb4',
  }),
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});


