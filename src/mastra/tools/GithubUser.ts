import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { octokit } from "../../utils/octokit";

interface GitHubResponse {
    ok: true;
    username: string;
    followers: number;
    following: number;
    public_repos: number;
    bio: string;
    email: string;
    location: string;
    company: string;
    website: string;
    twitter_username: string;
    avatar_url: string;
    url: string;
    blog: string;
    repositories: {
        name: string;
        description: string;
        url: string;
    }[];
}


async function getGitHubUser(username: string): Promise<GitHubResponse> {
    try {
        const { data } = await octokit.request('GET /users/{username}', {
            username
        });

        const repositories = await octokit.request('GET /users/{username}/repos', {
            username
        });
        return {
            ok: true,
            username: data.login,
            followers: data.followers,
            following: data.following,
            public_repos: data.public_repos,
            bio: data.bio || '',
            email: data.email || '',
            location: data.location || '',
            company: data.company || '',
            website: data.blog || '',
            twitter_username: data.twitter_username || '',
            avatar_url: data.avatar_url,
            url: data.url,
            blog: data.blog || '',
            repositories: repositories.data.map(repo => ({
                name: repo.name,
                description: repo.description || '',
                url: repo.html_url,
            })),
        };
    } catch (error) {
        throw new Error(`Failed to fetch GitHub user information for ${username}: ${error}`);
    }
}

const outputSchema = z.union([
    z
        .object({
            ok: z.literal(true),
            username: z.string().describe('GitHub username'),
            followers: z.number().describe('Number of followers'),
            following: z.number().describe('Number of users followed'),
            public_repos: z.number().describe('Number of public repositories'),
            bio: z.string().describe('User biography'),
            email: z.string().describe('User email'),
            location: z.string().describe('User location'),
            company: z.string().describe('User company'),
            website: z.string().describe('User website'),
            twitter_username: z.string().describe('User Twitter username'),
            avatar_url: z.string().describe('User avatar URL'),
            url: z.string().describe('User profile URL'),
            blog: z.string().describe('User blog URL'),
            repositories: z.array(z.object({
                name: z.string().describe('Repository name'),
                description: z.string().describe('Repository description'),
                url: z.string().describe('Repository URL'),
            })),
        })
        .describe("The success object"),
    z
        .object({
            ok: z.literal(false),
            message: z.string(),
        })
        .describe("The error/failed object"),
]);

const inputSchema = z.object({
    username: z.string().describe('GitHub username'),
}).refine(data => data.username.length > 0, {
    message: 'Username is required'
})

export const githubTool = createTool({
    id: 'get-github-user',
    description: 'Get GitHub user information',
    inputSchema: inputSchema,
    outputSchema: outputSchema,

    execute: async ({ context }) => {
        return await getGitHubUser(context.username);
    }
});
