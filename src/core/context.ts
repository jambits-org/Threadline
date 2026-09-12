import { buildRepositoryContract, type ContractSource, type RepositoryContract } from "./repository.js";
import { findRelevantHistory, searchTrackedFiles, type HistoryEntry } from "./history.js";

export type RepositoryContext = {
  topic: string;
  repositoryRoot: string;
  contract: RepositoryContract;
  relevantSources: ContractSource[];
  history: HistoryEntry[];
  matchingFiles: string[];
  warnings: string[];
};

export async function buildRepositoryContext(
  topic: string,
  startPath = process.cwd(),
  filePath?: string,
): Promise<RepositoryContext> {
  const contract = await buildRepositoryContract(startPath);
  const [history, matchingFiles] = await Promise.all([
    findRelevantHistory(contract.repositoryRoot, topic, filePath),
    searchTrackedFiles(contract.repositoryRoot, topic),
  ]);
  const normalizedTopic = topic.trim().toLowerCase();
  const relevantSources = contract.sources.filter((source) =>
    normalizedTopic
      ? source.content.toLowerCase().includes(normalizedTopic) || source.path.toLowerCase().includes(normalizedTopic)
      : true,
  );
  const warnings: string[] = [];

  if (contract.sources.length === 0) {
    warnings.push("No repository instructions or architecture documents were found.");
  }
  if (history.length === 0) {
    warnings.push("No Git history was available for the requested topic.");
  }
  if (relevantSources.length === 0 && normalizedTopic) {
    warnings.push("No contract document directly mentions the requested topic.");
  }

  return {
    topic,
    repositoryRoot: contract.repositoryRoot,
    contract,
    relevantSources,
    history,
    matchingFiles,
    warnings,
  };
}
