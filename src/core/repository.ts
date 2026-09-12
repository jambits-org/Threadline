import { access, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

export type ContractSource = {
  path: string;
  content: string;
};

export type RepositoryContract = {
  repositoryRoot: string;
  sources: ContractSource[];
  detectedPractices: string[];
};

const CONTRACT_PATHS = [
  "AGENTS.md",
  "CLAUDE.md",
  "CONTRIBUTING.md",
  "README.md",
  "ARCHITECTURE.md",
  "docs/architecture.md",
  ".github/pull_request_template.md",
  ".github/CODEOWNERS",
  "CODEOWNERS",
];

const PRACTICE_PATHS = [
  ["package.json", "Node package scripts"],
  ["pnpm-lock.yaml", "pnpm workspace"],
  ["package-lock.json", "npm lockfile"],
  ["yarn.lock", "Yarn lockfile"],
  [".github/workflows", "GitHub Actions workflows"],
  ["Dockerfile", "Docker build"],
  ["docker-compose.yml", "Docker Compose"],
  ["Makefile", "Make targets"],
];

export async function findRepositoryRoot(startPath = process.cwd()): Promise<string> {
  const resolvedPath = resolve(startPath);
  const pathStats = await stat(resolvedPath);
  let currentPath = pathStats.isDirectory() ? resolvedPath : dirname(resolvedPath);

  while (true) {
    if (await exists(resolve(currentPath, ".git"))) {
      return currentPath;
    }

    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      return resolvedPath;
    }
    currentPath = parentPath;
  }
}

export async function buildRepositoryContract(startPath = process.cwd()): Promise<RepositoryContract> {
  const repositoryRoot = await findRepositoryRoot(startPath);
  const sources = await Promise.all(
    CONTRACT_PATHS.map(async (candidatePath) => {
      const absolutePath = resolve(repositoryRoot, candidatePath);
      if (!(await exists(absolutePath))) {
        return undefined;
      }

      const content = await readFile(absolutePath, "utf8");
      return {
        path: relative(repositoryRoot, absolutePath),
        content: truncate(content, 8_000),
      };
    }),
  );

  const detectedPractices = (
    await Promise.all(
      PRACTICE_PATHS.map(async ([candidatePath, practice]) =>
        (await exists(resolve(repositoryRoot, candidatePath))) ? practice : undefined,
      ),
    )
  ).filter((practice): practice is string => practice !== undefined);

  return {
    repositoryRoot,
    sources: sources.filter((source): source is ContractSource => source !== undefined),
    detectedPractices,
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength) + "\n…";
}
