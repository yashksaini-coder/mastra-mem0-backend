import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { executeGraphQLQuery } from "../../utils/octokit";

interface GitHubResponse {
    username: string;
    repositories: {
        name: string;
        description: string;
        url: string;
    }[];
    followers: number;
    following: number;
    public_repos: number;
    bio: string;
    location: string;
    company: string;
    website: string;
    twitter_username: string;
    avatar_url: string;
    instagram_username: string;
    blog: string;
    youtube_username: string;
}


async function getGitHubUser(username: string): Promise<GitHubResponse> {
    // GraphQL query to fetch user data and repositories in a single request
    const query = `
      query GetUserInfo($username: String!) {
        user(login: $username) {
          login
          followers {
            totalCount
          }
          following {
            totalCount
          }
          bio
          location
          company
          websiteUrl
          twitterUsername
          avatarUrl
          socialAccounts(first: 10) {
            nodes {
              provider
              url
            }
          }
        }
      }
    `;

    try {
        const data = await executeGraphQLQuery<{
            user: {
                login: string;
                followers: { totalCount: number };
                following: { totalCount: number };
                repositories: {
                    totalCount: number;
                    nodes: Array<{
                        name: string;
                        description: string | null;
                        url: string;
                    }>;
                };
                bio: string | null;
                location: string | null;
                company: string | null;
                websiteUrl: string | null;
                twitterUsername: string | null;
                avatarUrl: string;
                socialAccounts: {
                    nodes: Array<{
                        provider: string;
                        url: string;
                    }>;
                };
            };
        }>(query, { username });

        // Find Instagram and YouTube from social accounts if available
        const socialAccounts = data.user.socialAccounts.nodes || [];
        const instagramAccount = socialAccounts.find(account => 
            account.provider.toLowerCase() === 'instagram');
        const youtubeAccount = socialAccounts.find(account => 
            account.provider.toLowerCase() === 'youtube');

        return {
            username: data.user.login,
            repositories: data.user.repositories.nodes.map(repo => ({
                name: repo.name,
                description: repo.description || '',
                url: repo.url
            })),
            followers: data.user.followers.totalCount,
            following: data.user.following.totalCount,
            public_repos: data.user.repositories.totalCount,
            bio: data.user.bio || '',
            location: data.user.location || '',
            company: data.user.company || '',
            website: data.user.websiteUrl || '',
            twitter_username: data.user.twitterUsername || '',
            avatar_url: data.user.avatarUrl,
            instagram_username: instagramAccount?.url || '',
            blog: data.user.websiteUrl || '',
            youtube_username: youtubeAccount?.url || '',
        };
    } catch (error) {
        console.error(`Error fetching GitHub data for user ${username}:`, error);
        throw new Error(`Failed to fetch GitHub data: ${error.message}`);
    }
}

// Rest of the code remains the same
export const githubTool = createTool({
    id: 'get-github-user',
    description: 'Get GitHub user information',
    inputSchema: z.object({
        username: z.string().describe('GitHub username'),
    }),
    outputSchema: z.object({
        username: z.string(),
        repositories: z.array(z.object({
            name: z.string(),
            description: z.string(),
            url: z.string(),
        })),
        followers: z.number(),
        following: z.number(),
        public_repos: z.number(),
        bio: z.string(),
        location: z.string(),
        company: z.string(),
        website: z.string(),
        twitter_username: z.string(),
        avatar_url: z.string(),
        instagram_username: z.string(),
        blog: z.string(),
        youtube_username: z.string(),
    }),
    execute: async ({ context }) => {
        return await getGitHubUser(context.username);
    }
});
