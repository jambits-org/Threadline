#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildRepositoryContext } from "./core/context.js";
import { buildRepositoryContract, findRepositoryRoot } from "./core/repository.js";
import { runMcpServer } from "./mcp.js";

const supportedClients = ["codex", "claude-code", "kiro"] as const;

async function main(): Promise<void> {
  const [command, ...argumentsList] = process.argv.slice(2);

  switch (command) {
    case "init":
      await initialize(argumentsList[0]);
      return;
    case "contract":
      print(await buildRepositoryContract(argumentsList[0]));
      return;
    case "context":
      await printContext(argumentsList);
      return;
    case "decisions":
      await printDecisions(argumentsList);
      return;
    case "mcp":
      await runMcpCommand(argumentsList);
      return;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      return;
    default:
      throw new Error("Unknown command: " + command);
  }
}

async function initialize(startPath?: string): Promise<void> {
  const repositoryRoot = await findRepositoryRoot(startPath);
  const configurationDirectory = resolve(repositoryRoot, ".threadline");
  const configurationPath = resolve(configurationDirectory, "config.json");

  try {
    const existingConfiguration = await readFile(configurationPath, "utf8");
    process.stdout.write("Threadline is already initialized.\n" + existingConfiguration + "\n");
    return;
  } catch {
    await mkdir(configurationDirectory, { recursive: true });
  }

  const configuration = {
    version: 1,
    repositoryRoot,
    createdAt: new Date().toISOString(),
  };
  await writeFile(configurationPath, JSON.stringify(configuration, null, 2) + "\n", "utf8");
  process.stdout.write("Initialized Threadline for " + repositoryRoot + "\n");
}

async function printContext(argumentsList: string[]): Promise<void> {
  const topic = argumentsList[0];
  if (!topic) {
    throw new Error("Usage: threadline context <ticket-or-topic> [repository-path] [file-path]");
  }
  print(await buildRepositoryContext(topic, argumentsList[1], argumentsList[2]));
}

async function printDecisions(argumentsList: string[]): Promise<void> {
  const query = argumentsList[0];
  if (!query) {
    throw new Error("Usage: threadline decisions <query> [repository-path]");
  }
  const context = await buildRepositoryContext(query, argumentsList[1]);
  print({
    query,
    sources: context.relevantSources,
    history: context.history,
    warnings: context.warnings,
  });
}

async function runMcpCommand(argumentsList: string[]): Promise<void> {
  const [subcommand, ...rest] = argumentsList;
  if (subcommand === "serve") {
    await runMcpServer();
    return;
  }

  if (subcommand === "config") {
    const clientName = rest[0] ?? "codex";
    if (!supportedClients.includes(clientName as (typeof supportedClients)[number])) {
      throw new Error("Unsupported client: " + clientName);
    }
    print({
      client: clientName,
      mcpServer: {
        command: "npx",
        args: ["-y", "@maazbin/threadline", "mcp", "serve"],
      },
    });
    return;
  }

  throw new Error("Usage: threadline mcp <serve|config> [codex|claude-code|kiro]");
}

function print(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function printHelp(): void {
  process.stdout.write(
    [
      "Threadline",
      "",
      "Commands:",
      "  threadline init [repository-path]",
      "  threadline contract [repository-path]",
      "  threadline context <topic> [repository-path] [file-path]",
      "  threadline decisions <query> [repository-path]",
      "  threadline mcp serve",
      "  threadline mcp config [codex|claude-code|kiro]",
      "",
    ].join("\n"),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write("Threadline error: " + message + "\n");
  process.exitCode = 1;
});
