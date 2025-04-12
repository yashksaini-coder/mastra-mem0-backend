import { Mem0Integration } from "@mastra/mem0";

export const mem0 = new Mem0Integration({
  config: {
    apiKey: process.env.MEM0_API_KEY!,
    userId: "yash_kumar_19",
  },
});