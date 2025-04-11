import { Octokit } from '@octokit/core';

// Get GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
}

// Create authenticated Octokit instance
export const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});