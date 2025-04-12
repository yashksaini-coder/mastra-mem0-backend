import { createTool } from "@mastra/core";
import { z } from "zod";
import { mem0 } from "../integrations";

// Schema for recipient information
const recipientSchema = z.object({
  name: z.string(),
  email: z.string(),
  username: z.string().optional(),
});

// Schema for generated email
const emailSchema = z.object({
  recipient: recipientSchema,
  subject: z.string(),
  body: z.string(),
  generatedAt: z.string(),
});

// Schema for trigger data
const triggerDataSchema = z.object({
  owner: z.string(),
  repo: z.string(),
}).passthrough(); // Allow additional properties

// Schema for statistics
const statsSchema = z.object({
  totalAuthors: z.number(),
  totalEmails: z.number(),
  averageEmailLength: z.number(),
  generatedAt: z.string(),
  uniqueDomains: z.array(z.string()),
});

// Comprehensive schema for repository and email campaign
const repositoryCampaignSchema = z.object({
  repository: z.object({
    owner: z.string(),
    name: z.string(),
    totalAuthors: z.number(),
    processedAt: z.string(),
  }),
  campaign: z.object({
    totalEmails: z.number(),
    recipients: z.array(recipientSchema),
    emails: z.array(emailSchema),
    generatedAt: z.string(),
    allEmailBodies: z.array(z.string()),
  }),
  metadata: z.object({
    campaignId: z.string(),
    status: z.enum(["completed", "failed", "in_progress"]),
    lastUpdated: z.string(),
    query: z.object({
      owner: z.string(),
      repo: z.string(),
      timestamp: z.string(),
    }).optional(),  
  }),
  // Step outputs with open-ended schema to accommodate any step result structure
  stepOutputs: z.object({
    triggerData: triggerDataSchema,
    getAuthorsStep: z.any(),
    generateEmailsStep: z.any(),
  }).passthrough(),
  // Statistics for analysis
  stats: statsSchema,
});

export const mem0RememberTool = createTool({
  id: "Mem0-remember",
  description:
    "Remember your agent memories that you've previously saved using the Mem0-memorize tool.",
  inputSchema: z.object({
    question: z
      .string()
      .describe("Question used to look up the answer in saved memories."),
  }),
  outputSchema: z.object({
    answer: z.string().describe("Remembered answer"),
  }),
  execute: async ({ context }) => {
    console.log(`Searching memory "${context.question}"`);
    const memory = await mem0.searchMemory(context.question);
    console.log(`\nFound memory "${memory}"\n`);

    return {
      answer: memory,
    };
  },
});

export const mem0MemorizeTool = createTool({
  id: "Mem0-memorize",
  description:
    "Save information to mem0 so you can remember it later using the Mem0-remember tool.",
  inputSchema: z.object({
    data: repositoryCampaignSchema,
  }),
  execute: async ({ context }) => {
    const { data } = context;
    const campaign = repositoryCampaignSchema.parse(data);

    // Create a structured memory statement
    const statement = `Repository Campaign Information:
      Repository: ${campaign.repository.owner}/${campaign.repository.name}
      Total Authors: ${campaign.repository.totalAuthors}
      Processed At: ${campaign.repository.processedAt}
      
      Campaign Details:
      Total Emails: ${campaign.campaign.totalEmails}
      Generated At: ${campaign.campaign.generatedAt}
      
      Recipients:
      ${campaign.campaign.recipients.map(r => 
        `- ${r.name} (${r.email})${r.username ? ` [${r.username}]` : ''}`
      ).join('\n      ')}
      
      Generated Emails:
      ${campaign.campaign.emails.map(e => 
        `To: ${e.recipient.name} (${e.recipient.email})
         Subject: ${e.subject}
         Generated At: ${e.generatedAt}
         Body: ${e.body}
         ---`
      ).join('\n      ')}
      
      All Email Bodies:
      ${campaign.campaign.allEmailBodies.map((body, index) => 
        `--- Email ${index + 1} ---
         ${body}
         --------------`
      ).join('\n      ')}
      
      Statistics:
      Total Authors: ${campaign.stats.totalAuthors}
      Total Emails: ${campaign.stats.totalEmails}
      Average Email Length: ${campaign.stats.averageEmailLength} characters
      Unique Domains: ${campaign.stats.uniqueDomains.join(', ')}
      
      Metadata:
      Campaign ID: ${campaign.metadata.campaignId}
      Status: ${campaign.metadata.status}
      Last Updated: ${campaign.metadata.lastUpdated}
      ${campaign.metadata.query ? `Query: ${campaign.metadata.query.owner}/${campaign.metadata.query.repo} (${campaign.metadata.query.timestamp})` : ''}
      
      Step Outputs: [STORED BUT NOT DISPLAYED DUE TO SIZE]`;

    console.log(`\nCreating memory for campaign ${campaign.metadata.campaignId}\n`);
    await mem0.createMemory(statement);
    
    // Also store a compact JSON representation for machine consumption
    const jsonStatement = `JSON_DATA:${JSON.stringify(campaign)}`;
    await mem0.createMemory(jsonStatement);
    
    console.log(`\nMemory saved successfully\n`);

    return { 
      success: true,
      campaignId: campaign.metadata.campaignId,
      totalEmails: campaign.campaign.totalEmails
    };
  },
});