import { Workflow, Step } from "@mastra/core/workflows";
import { z } from "zod";
import { GithubAgent, EmailAgent, editorAgent } from "../agents";
import fs from 'fs';
import path from 'path';

interface Author {
  name: string;
  email: string;
  username?: string;
}

interface Email {
  name: string;
  email: string;
  subject: string;
  body: string;
}

const mem0Workflow = new Workflow({
  name: "mem0-email-workflow",
  triggerSchema: z.object({
    owner: z.string().describe("The owner of the repository"),
    repo: z.string().describe("The name of the repository"),
  }),
});

const getAuthorsStep = new Step({
  id: "getAuthors",
  execute: async ({ context }) => {
    // Get repository commits
    if (!GithubAgent.tools?.getRepositoryCommits?.execute) {
      throw new Error("GithubAgent tool not properly initialized");
    }

    const commitsResult = await GithubAgent.tools.getRepositoryCommits.execute({
      context: {
        owner: context.triggerData.owner,
        repo: context.triggerData.repo,
      },
    });

    if (!commitsResult.ok) {
      throw new Error(`Failed to get commits: ${commitsResult.message}`);
    }

    // Get unique authors, filtering out no-reply emails
    const uniqueAuthors = new Map<string, Author>();
    commitsResult.commits.forEach(commit => {
      const email = commit.author.email;
      const name = commit.author.name;
      
      // Skip if email is a no-reply GitHub email
      if (email && !email.includes('@users.noreply.github.com')) {
        uniqueAuthors.set(email, {
          name: name,
          email: email,
          username: commit.author.username,
        });
      }
    });

    return {
      authors: Array.from(uniqueAuthors.values()),
    };
  },
});

const generateEmailsStep = new Step({
  id: "generateEmails",
  execute: async ({ context }) => {
    const authors = context.getStepResult<{ authors: Author[] }>("getAuthors")?.authors || [];
    const emails: Email[] = [];

    for (const author of authors) {
      // Generate email subject
      const subjectResult = await EmailAgent.generate(`
        Generate a compelling subject line for an email to ${author.name} about Mem0.ai,
        The subject should be professional and highlight the value proposition.
        Keep it under 6-12 words.
      `);

      // Generate email content
      const emailResult = await EmailAgent.generate(`
        Write a personalized email to ${author.name} about how Mem0.ai can enhance their AI applications.
        Focus on:
        1. How Mem0.ai provides a memory layer for LLM applications
        2. Benefits of personalized AI experiences
        3. Cost savings through intelligent data filtering
        4. Easy integration with existing AI solutions
        Keep it professional and concise.
      `);

      // Edit the email
      const editedResult = await editorAgent.generate(`
        Edit this email to make it more professional and personalized for ${author.name}:
        ${emailResult.text}

        Make sure to include the subject line in the email. 
        Make sure to include the name of the recipient in the email.
        Make sure to include the company name in the email.
        Make sure to include the company website in the email.
        Also do not use any other words than what is provided in the email.

      `);

      emails.push({
        name: author.name,
        email: author.email,
        subject: subjectResult.text.trim(),
        body: editedResult.text,
      });
    }

    return { emails };
  },
});

const createCSVStep = new Step({
  id: "createCSV",
  execute: async ({ context }) => {
    const emails = context.getStepResult<{ emails: Email[] }>("generateEmails")?.emails || [];
    
    // Create CSV content with proper escaping for fields containing commas
    const csvContent = emails.map(e => {
      const escapedName = e.name.includes(',') ? `"${e.name}"` : e.name;
      const escapedEmail = e.email.includes(',') ? `"${e.email}"` : e.email;
      const escapedSubject = e.subject.includes(',') ? `"${e.subject}"` : e.subject;
      const escapedBody = e.body.includes(',') ? `"${e.body}"` : e.body;
      return `${escapedName},${escapedEmail},${escapedSubject},${escapedBody}`;
    }).join('\n');
    
    const csvHeader = 'Name,Email,Subject,Body\n';
    
    // Write to CSV file
    const outputPath = path.join(process.cwd(), 'output', `${context.triggerData.owner}-${context.triggerData.repo}-emails.csv`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, csvHeader + csvContent);

    return { outputPath };
  },
});

mem0Workflow
  .step(getAuthorsStep)
  .then(generateEmailsStep)
  .then(createCSVStep);

export { mem0Workflow };
   