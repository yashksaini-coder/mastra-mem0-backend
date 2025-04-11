import { groq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import { githubTool } from '../tools/GithubUser';
import { getRepositoryCommits } from '../tools/GithubRepo';
import { instructions } from '../instructions/gh-user';

export const GithubAgent = new Agent({
  name: 'Github User Agent',
  instructions: instructions,
  model: groq('llama-3.3-70b-versatile'),
  tools: { githubTool, getRepositoryCommits },
});
