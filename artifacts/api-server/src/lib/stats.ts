import { logger } from "./logger";

export const LEETCODE_USERNAME = "akamalshaikh";
export const GITHUB_USERNAME = "akamalferojshaikh";

const CACHE_TTL_MS = 10 * 60 * 1000;
// How long a stale value may keep being served while the upstream is failing.
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 12_000;

type CacheEntry<T> = { value: T; fetchedAt: number };
const cache = new Map<string, CacheEntry<unknown>>();
// Single-flight: concurrent requests after expiry share one upstream call
// (GitHub allows only 60 unauthenticated requests/hour per IP).
const inflight = new Map<string, Promise<unknown>>();

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();
  if (hit && now - hit.fetchedAt < CACHE_TTL_MS) return hit.value;

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const run = (async () => {
    try {
      const value = await load();
      cache.set(key, { value, fetchedAt: Date.now() });
      return value;
    } catch (err) {
      if (hit && Date.now() - hit.fetchedAt < MAX_STALE_MS) {
        logger.warn({ err, key }, "Upstream failed; serving stale cache");
        return hit.value;
      }
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, run);
  return run;
}

// Fetch and parse JSON with a single deadline covering headers and body.
async function fetchJson<T>(url: string, init: RequestInit): Promise<{ ok: boolean; status: number; json: T }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const json = (await res.json()) as T;
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(t);
  }
}

// ---------- LeetCode ----------

export type LeetcodeStats = {
  username: string;
  profileUrl: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  contestsAttended: number | null;
  globalRanking: number | null;
  topPercentage: number | null;
  streak: number;
  totalActiveDays: number;
  calendar: { date: string; count: number }[];
  fetchedAt: string;
};

const LEETCODE_QUERY = `
query portfolioStats($u: String!) {
  matchedUser(username: $u) {
    username
    userCalendar { streak totalActiveDays submissionCalendar }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  userContestRanking(username: $u) {
    rating attendedContestsCount globalRanking topPercentage
  }
}`;

type LeetcodeResponse = {
  data?: {
    matchedUser: {
      username: string;
      userCalendar: { streak: number; totalActiveDays: number; submissionCalendar: string };
      submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] };
    } | null;
    userContestRanking: {
      rating: number;
      attendedContestsCount: number;
      globalRanking: number;
      topPercentage: number;
    } | null;
  };
  errors?: { message: string }[];
};

export function getLeetcodeStats(): Promise<LeetcodeStats> {
  return cached("leetcode", async () => {
    const res = await fetchJson<LeetcodeResponse>("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        referer: `https://leetcode.com/u/${LEETCODE_USERNAME}/`,
        "user-agent": "Mozilla/5.0 (portfolio stats)",
      },
      body: JSON.stringify({ query: LEETCODE_QUERY, variables: { u: LEETCODE_USERNAME } }),
    });
    if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);
    const json = res.json;
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
    const user = json.data?.matchedUser;
    if (!user) throw new Error("LeetCode user not found");

    const counts: Record<string, number> = {};
    for (const row of user.submitStatsGlobal.acSubmissionNum) counts[row.difficulty] = row.count;

    const raw = JSON.parse(user.userCalendar.submissionCalendar || "{}") as Record<string, number>;
    const oneYearAgo = Date.now() / 1000 - 366 * 86400;
    const calendar = Object.entries(raw)
      .map(([ts, count]) => ({ ts: Number(ts), count }))
      .filter((d) => d.ts >= oneYearAgo && d.count > 0)
      .sort((a, b) => a.ts - b.ts)
      .map((d) => ({ date: new Date(d.ts * 1000).toISOString().slice(0, 10), count: d.count }));

    const contest = json.data?.userContestRanking ?? null;

    return {
      username: user.username,
      profileUrl: `https://leetcode.com/u/${user.username}/`,
      totalSolved: counts["All"] ?? 0,
      easySolved: counts["Easy"] ?? 0,
      mediumSolved: counts["Medium"] ?? 0,
      hardSolved: counts["Hard"] ?? 0,
      contestRating: contest ? Math.round(contest.rating) : null,
      contestsAttended: contest?.attendedContestsCount ?? null,
      globalRanking: contest?.globalRanking ?? null,
      topPercentage: contest ? Math.round(contest.topPercentage * 10) / 10 : null,
      streak: user.userCalendar.streak,
      totalActiveDays: user.userCalendar.totalActiveDays,
      calendar,
      fetchedAt: new Date().toISOString(),
    };
  });
}

// ---------- GitHub ----------

export type GithubStats = {
  username: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  repos: {
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    pushedAt: string;
  }[];
  fetchedAt: string;
};

type GithubUser = { login: string; html_url: string; public_repos: number; followers: number };
type GithubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
};

export function getGithubStats(): Promise<GithubStats> {
  return cached("github", async () => {
    const headers: Record<string, string> = {
      accept: "application/vnd.github+json",
      "user-agent": "portfolio-stats",
    };
    // Optional. Unauthenticated calls are limited to 60/hour per IP, which is
    // too tight on shared CI runners (the GitHub Pages deploy workflow passes
    // its built-in token). Locally the cache keeps us well under the limit.
    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const [userRes, reposRes] = await Promise.all([
      fetchJson<GithubUser>(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
      fetchJson<GithubRepo[]>(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=10`,
        { headers },
      ),
    ]);
    if (!userRes.ok) throw new Error(`GitHub user responded ${userRes.status}`);
    if (!reposRes.ok) throw new Error(`GitHub repos responded ${reposRes.status}`);
    const user = userRes.json;
    const repos = reposRes.json;

    return {
      username: user.login,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      repos: repos
        .filter((r) => !r.fork)
        .map((r) => ({
          name: r.name,
          url: r.html_url,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          pushedAt: r.pushed_at,
        })),
      fetchedAt: new Date().toISOString(),
    };
  });
}
