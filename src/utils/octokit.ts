import { Octokit } from '@octokit/core';
import { graphql } from '@octokit/graphql';

// Get GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
}

// Create authenticated Octokit instance
export const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

// Create authenticated GraphQL client
export const octokitGraphql = graphql.defaults({
    headers: {
        authorization: `token ${GITHUB_TOKEN}`,
    },
});

// Example GraphQL query function
export async function executeGraphQLQuery<T>(query: string, variables?: any): Promise<T> {
    try {
        return await octokitGraphql<T>(query, variables);
    } catch (error) {
        console.error('GraphQL Query Error:', error);
        throw error;
    }
}