import { format } from "date-fns";
import { useEffect, useRef } from "react";
import { useGithubStats, useLeetcodeStats } from "@/hooks/use-stats";
import { CountUp } from "./animations";
import { Skeleton } from "./ui/skeleton";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";

export function StatsSection() {
  const { data: lcData, isLoading: lcLoading, error: lcError } = useLeetcodeStats();
  const { data: ghData, isLoading: ghLoading, error: ghError } = useGithubStats();
  const loading = lcLoading || ghLoading;

  // Swapping skeletons for real content changes the page height, so
  // scroll-triggered animations further down need their positions re-measured.
  useEffect(() => {
    if (!loading) ScrollTrigger.refresh();
  }, [loading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16" aria-busy={loading}>
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
                <div className="text-2xl font-medium"><CountUp value={lcData.totalSolved} /></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Rating</div>
                <div className="text-2xl font-medium">{lcData.contestRating ? <CountUp value={Math.round(lcData.contestRating)} /> : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Max streak</div>
                <div className="text-2xl font-medium"><CountUp value={lcData.streak} /><span className="text-sm text-muted-foreground ml-1">days</span></div>
              </div>
            </div>

            <ActivityGrid calendar={lcData.calendar} />
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
                <div className="text-xl font-medium"><CountUp value={ghData.publicRepos} /></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Followers</div>
                <div className="text-xl font-medium"><CountUp value={ghData.followers} /></div>
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

/** Last 90 calendar days of LeetCode submissions, including days with none. */
function ActivityGrid({ calendar }: { calendar: { date: string; count: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const counts = new Map(calendar.map((d) => [d.date, d.count]));
  const days: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) ?? 0 });
  }
  const active = days.filter((d) => d.count > 0).length;
  const total = days.reduce((n, d) => n + d.count, 0);

  // Cells pop in column by column, oldest day first.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-activity-cell]", {
        scale: 0,
        duration: 0.4,
        ease: "back.out(2)",
        stagger: 0.008,
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="space-y-2">
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
            data-activity-cell
          />
        ))}
      </div>
    </div>
  );
}
