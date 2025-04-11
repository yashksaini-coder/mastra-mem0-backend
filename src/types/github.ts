export interface GitHubResponse {
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

