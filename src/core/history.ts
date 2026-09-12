import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

const executeFile = promisify(execFile);

export type HistoryEntry = {
  hash: string;
  date: string;
  subject: string;
};

export async function findRelevantHistory(
  repositoryRoot: string,
  topic: string,
  filePath?: string,
): Promise<HistoryEntry[]> {
  const normalizedTopic = topic.trim();
  const topicEntries = normalizedTopic
    ? await gitLog(repositoryRoot, [
        "log",
        "--all",
        "--format=%h%x09%ad%x09%s",
        "--date=short",
        "-n",
        "12",
        "--grep=" + normalizedTopic,
      ])
    : [];

  if (filePath && (await isTrackedPath(repositoryRoot, filePath))) {
    const fileEntries = await gitLog(repositoryRoot, [
      "log",
      "--follow",
      "--format=%h%x09%ad%x09%s",
      "--date=short",
      "-n",
      "12",
      "--",
      filePath,
    ]);
    return uniqueEntries([...topicEntries, ...fileEntries]);
  }

  return topicEntries.length > 0
    ? topicEntries
    : gitLog(repositoryRoot, ["log", "--format=%h%x09%ad%x09%s", "--date=short", "-n", "8"]);
}

export async function searchTrackedFiles(
  repositoryRoot: string,
  query: string,
  maximumResults = 20,
): Promise<string[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const { stdout } = await executeFile("git", ["grep", "-Il", "--", query], {
      cwd: repositoryRoot,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(0, maximumResults);
  } catch {
    return [];
  }
}

async function isTrackedPath(repositoryRoot: string, filePath: string): Promise<boolean> {
  try {
    await executeFile("git", ["ls-files", "--error-unmatch", resolve(repositoryRoot, filePath)], {
      cwd: repositoryRoot,
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

async function gitLog(repositoryRoot: string, argumentsList: string[]): Promise<HistoryEntry[]> {
  try {
    const { stdout } = await executeFile("git", argumentsList, {
      cwd: repositoryRoot,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    return stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [hash, date, ...subjectParts] = line.split("\t");
        return { hash, date, subject: subjectParts.join("\t") };
      });
  } catch {
    return [];
  }
}

function uniqueEntries(entries: HistoryEntry[]): HistoryEntry[] {
  const hashes = new Set<string>();
  return entries.filter((entry) => {
    if (hashes.has(entry.hash)) {
      return false;
    }
    hashes.add(entry.hash);
    return true;
  });
}
