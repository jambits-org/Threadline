import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildRepositoryContext } from "./core/context.js";
import { buildRepositoryContract } from "./core/repository.js";

export async function runMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "threadline",
    version: "0.1.0",
  });

  server.tool(
    "threadline_get_contract",
    "Read the repository-specific engineering contract: instructions, architecture references, PR conventions, and detected practices.",
    {
      repositoryPath: z.string().optional().describe("Repository or file path. Defaults to the current working directory."),
    },
    async ({ repositoryPath }) => textResult(await buildRepositoryContract(repositoryPath)),
  );

  server.tool(
    "threadline_get_context",
    "Build cited repository context for a ticket key, feature, file, or engineering question using the existing contract and Git history.",
    {
      topic: z.string().describe("Ticket key, feature name, file, or engineering question."),
      repositoryPath: z.string().optional().describe("Repository or file path. Defaults to the current working directory."),
      filePath: z.string().optional().describe("Optional repository-relative file path for focused history."),
    },
    async ({ topic, repositoryPath, filePath }) =>
      textResult(await buildRepositoryContext(topic, repositoryPath, filePath)),
  );

  server.tool(
    "threadline_find_decisions",
    "Find likely repository decisions by searching engineering-contract documents and relevant Git history.",
    {
      query: z.string().describe("Decision, constraint, architecture topic, or ticket key to investigate."),
      repositoryPath: z.string().optional().describe("Repository or file path. Defaults to the current working directory."),
    },
    async ({ query, repositoryPath }) => {
      const context = await buildRepositoryContext(query, repositoryPath);
      return textResult({
        query,
        sources: context.relevantSources,
        history: context.history,
        warnings: context.warnings,
      });
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function textResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
