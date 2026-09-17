/**
 * Writes the current LeetCode and GitHub stats to disk as JSON.
 *
 * The published site on GitHub Pages is static, so there is no API server to
 * proxy the stats at runtime. The deploy workflow runs this script before
 * `vite build`; the frontend, built with VITE_STATS_SOURCE=static, then reads
 * /data/leetcode.json and /data/github.json instead of calling /api/stats/*.
 *
 * Usage: pnpm --filter @workspace/api-server run snapshot-stats <out-dir>
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetGithubStatsResponse, GetLeetcodeStatsResponse } from "@workspace/api-zod";
import { getGithubStats, getLeetcodeStats } from "../lib/stats";

const outDir = process.argv[2];
if (!outDir) {
  console.error("Usage: snapshot-stats <out-dir>");
  process.exit(1);
}

// Parse through the API contract so the files match what /api/stats/* serves.
const [leetcode, github] = await Promise.all([
  getLeetcodeStats().then((s) => GetLeetcodeStatsResponse.parse(s)),
  getGithubStats().then((s) => GetGithubStatsResponse.parse(s)),
]);

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "leetcode.json"), JSON.stringify(leetcode));
await writeFile(path.join(outDir, "github.json"), JSON.stringify(github));

console.log(
  `Wrote ${path.resolve(outDir)}: leetcode.json (${leetcode.totalSolved} solved), ` +
    `github.json (${github.publicRepos} repos)`,
);
