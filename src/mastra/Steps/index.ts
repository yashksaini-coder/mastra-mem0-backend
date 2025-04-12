import { Step} from "@mastra/core/workflows";
import { EmailAgent, editorAgent } from "../agents";

export const emailwriterStep = new Step({
    id: "emailwriterStep",
    execute: async ({ context }) => {
      if (!context?.triggerData?.email) {
        throw new Error("Email not found in trigger data");
      }
      const result = await EmailAgent.generate(
        `Write a cold email to the ${context.triggerData.email} about how I can be of value to their team and work alongside to build stuff.`,
      );
      console.log("emailwriter result", result.text);
      return {
        copy: result.text,
      };
    },
  });

  export const editorStep = new Step({
    id: "editorStep",
    execute: async ({ context }) => {
      const copy = context?.getStepResult<{ copy: number }>("emailwriterStep")?.copy;
   
      const result = await editorAgent.generate(
        `Edit the following email only returning the edited copy: ${copy}`,
      );
      console.log("editor result", result.text);
      return {
        copy: result.text,
      };
    },
  });