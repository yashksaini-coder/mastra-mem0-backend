import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { githubTool } from '../tools/GithubUser';
import { getRepositoryCommits } from '../tools/GithubRepo';
import { instructions } from '../instructions/gh-user';
import { getFileContent } from '../tools/GetFile';
import { getFilePaths } from '../tools/GetFilePath';

export const GithubAgent = new Agent({
  name: 'Github User Agent',
  instructions: instructions,
  model: groq('llama-3.3-70b-versatile'),
  tools: { githubTool, getRepositoryCommits, getFileContent, getFilePaths },
});

export const EmailAgent = new Agent({
  name: 'Writer Agent',
  instructions: 'You are a professional HR of an MNC and a writer. Write a detailed email for the given subject and recipient.',
  model: groq('llama-3.3-70b-versatile'),
});

export const editorAgent = new Agent({
  name: "Editor",
  instructions: "You are an editor agent that edits email posts. Do not change the content of the email, only edit the formatting. Also you are stricted to provide any other additional inof like what you did in the edit.",
  model: groq("llama-3.3-70b-versatile"),
});