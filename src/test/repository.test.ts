import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildRepositoryContext } from "../core/context.js";
import { buildRepositoryContract } from "../core/repository.js";

test("buildRepositoryContract discovers repository rules and practices", async () => {
  const fixtureRoot = await createFixture();
  try {
    const contract = await buildRepositoryContract(fixtureRoot);
    assert.equal(contract.sources.length, 2);
    assert.equal(contract.sources[0]?.path, "AGENTS.md");
    assert.ok(contract.detectedPractices.includes("Node package scripts"));
    assert.ok(contract.detectedPractices.includes("GitHub Actions workflows"));
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("buildRepositoryContext returns relevant repository contract sources", async () => {
  const fixtureRoot = await createFixture();
  try {
    const context = await buildRepositoryContext("authentication", fixtureRoot);
    assert.equal(context.relevantSources.length, 1);
    assert.equal(context.relevantSources[0]?.path, "AGENTS.md");
    assert.ok(context.warnings.some((warning) => warning.includes("Git history")));
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

async function createFixture(): Promise<string> {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "threadline-"));
  await mkdir(join(fixtureRoot, ".git"));
  await mkdir(join(fixtureRoot, ".github", "workflows"), { recursive: true });
  await writeFile(join(fixtureRoot, "AGENTS.md"), "Authentication changes require security review.\n", "utf8");
  await writeFile(join(fixtureRoot, "README.md"), "# Fixture\n", "utf8");
  await writeFile(join(fixtureRoot, "package.json"), "{\"scripts\":{\"test\":\"node --test\"}}\n", "utf8");
  await writeFile(join(fixtureRoot, ".github", "workflows", "check.yml"), "name: check\n", "utf8");
  return fixtureRoot;
}
