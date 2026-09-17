import { useQuery } from "@tanstack/react-query";
import {
  getGetGithubStatsQueryKey,
  getGetLeetcodeStatsQueryKey,
  getGithubStats,
  getLeetcodeStats,
  type GithubStats,
  type LeetcodeStats,
} from "@workspace/api-client-react";

/**
 * Where the coding-activity stats come from, decided at build time:
 *
 * - default: the API server proxies LeetCode and GitHub live (`/api/stats/*`).
 * - `VITE_STATS_SOURCE=static`: JSON snapshots written to `public/data/` by
 *   `pnpm --filter @workspace/api-server run snapshot-stats` right before the
 *   build. Used for GitHub Pages, where no server runs; the deploy workflow
 *   rebuilds on a schedule so the numbers stay current.
 */
const STATIC = import.meta.env.VITE_STATS_SOURCE === "static";

async function fetchSnapshot<T>(name: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`, { signal });
  if (!res.ok) throw new Error(`Stats snapshot ${name}.json responded ${res.status}`);
  return (await res.json()) as T;
}

export function useLeetcodeStats() {
  return useQuery<LeetcodeStats, Error>({
    queryKey: getGetLeetcodeStatsQueryKey(),
    queryFn: ({ signal }) =>
      STATIC ? fetchSnapshot<LeetcodeStats>("leetcode", signal) : getLeetcodeStats({ signal }),
  });
}

export function useGithubStats() {
  return useQuery<GithubStats, Error>({
    queryKey: getGetGithubStatsQueryKey(),
    queryFn: ({ signal }) =>
      STATIC ? fetchSnapshot<GithubStats>("github", signal) : getGithubStats({ signal }),
  });
}
