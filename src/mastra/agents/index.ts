import { groq } from '@ai-sdk/groq';
import { Agent } from '@mastra/core/agent';
import { githubTool } from '../tools/gh-user';

export const GithubAgent = new Agent({
  name: 'Github Agent',
  instructions: `
      You are a helpful Github assistant that provides accurate information about Github repositories.
      Your primary function is to help users get information about the User/Developer. When responding:
      - Always ask for a username or Github repository if none is provided
      - If the repository name isn’t in English, please translate it
      - If giving a repository with multiple parts (e.g. "octokit/rest.js"), use the most relevant part (e.g. "octokit")
      - Solve the best 10 projects, based on number of stars, activity, and relevance.
      - Keep responses concise but informative
      Use the GithubTool to fetch current repository data.
  `,

  model: groq('llama-3.3-70b-versatile'),
  tools: { githubTool },
});

