import { format } from "date-fns";
import { useGithubStats, useLeetcodeStats } from "@/hooks/use-stats";
import { Skeleton } from "./ui/skeleton";

export function StatsSection() {
  const { data: lcData, isLoading: lcLoading, error: lcError } = useLeetcodeStats();
  const { data: ghData, isLoading: ghLoading, error: ghError } = useGithubStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24 border-t border-border/50 pt-16" aria-busy={lcLoading || ghLoading}>
      {/* LeetCode Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">LeetCode</h3>
          {!lcLoading && !lcError && lcData && (
            <a href={lcData.profileUrl} target="_blank" rel="noreferrer" className="text-xs font-mono hover:text-primary transition-colors border-b border-transparent hover:border-primary">
              @{lcData.username}
            </a>
          )}
        </div>

        {lcLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full bg-muted" />
            <Skeleton className="h-40 w-full bg-muted" />
          </div>
        ) : lcError || !lcData ? (
          <div className="text-sm text-muted-foreground">
            View profile on <a href="https://leetcode.com/u/akamalshaikh/" className="underline hover:text-primary">LeetCode</a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Total</div>
                <div className="text-2xl font-medium">{lcData.totalSolved}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Rating</div>
                <div className="text-2xl font-medium">{lcData.contestRating ? Math.round(lcData.contestRating) : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Max streak</div>
                <div className="text-2xl font-medium">{lcData.streak}<span className="text-sm text-muted-foreground ml-1">days</span></div>
              </div>
            </div>

            {/* Activity: last 90 calendar days, including days with no submissions */}
            {(() => {
              const counts = new Map(lcData.calendar.map((d) => [d.date, d.count]));
              const days: { date: string; count: number }[] = [];
              const today = new Date();
              for (let i = 89; i >= 0; i--) {
                const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
                const key = d.toISOString().slice(0, 10);
                days.push({ date: key, count: counts.get(key) ?? 0 });
              }
              const active = days.filter((d) => d.count > 0).length;
              const total = days.reduce((n, d) => n + d.count, 0);
              return (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="text-xs text-muted-foreground font-mono">Last 90 days</div>
                    <div className="text-xs text-muted-foreground font-mono">{active} active days · {total} submissions</div>
                  </div>
                  <div
                    className="grid grid-flow-col grid-rows-7 gap-1 w-fit"
                    role="img"
                    aria-label={`LeetCode activity, last 90 days: ${active} active days, ${total} submissions`}
                  >
                    {days.map((day) => (
                      <div
                        key={day.date}
                        title={`${day.count} submission${day.count === 1 ? "" : "s"} on ${format(new Date(day.date + "T00:00:00Z"), "d MMM")}`}
                        className={day.count > 0 ? "w-2.5 h-2.5 rounded-sm bg-primary" : "w-2.5 h-2.5 rounded-sm bg-muted-foreground/15"}
                        style={day.count > 0 ? { opacity: Math.max(0.3, Math.min(1, day.count / 5)) } : undefined}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* GitHub Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">GitHub</h3>
          {!ghLoading && !ghError && ghData && (
            <a href={ghData.profileUrl} target="_blank" rel="noreferrer" className="text-xs font-mono hover:text-primary transition-colors border-b border-transparent hover:border-primary">
              @{ghData.username}
            </a>
          )}
        </div>

        {ghLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-muted" />
            <Skeleton className="h-12 w-full bg-muted" />
            <Skeleton className="h-12 w-full bg-muted" />
          </div>
        ) : ghError || !ghData ? (
          <div className="text-sm text-muted-foreground">
            View profile on <a href="https://github.com/akamalferojshaikh" className="underline hover:text-primary">GitHub</a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Repos</div>
                <div className="text-xl font-medium">{ghData.publicRepos}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Followers</div>
                <div className="text-xl font-medium">{ghData.followers}</div>
              </div>
            </div>

            <div className="space-y-3">
              {ghData.repos.slice(0, 3).map((repo) => (
                <div key={repo.name} className="flex justify-between items-baseline border-b border-border/40 pb-2">
                  <a href={repo.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                    {repo.name}
                  </a>
                  <span className="text-xs font-mono text-muted-foreground flex gap-3">
                    {repo.language && <span>{repo.language}</span>}
                    <span>★ {repo.stars}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
