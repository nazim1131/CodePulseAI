import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { Repository } from "@/lib/types";
import { Link } from "react-router-dom";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { GitBranch, Clock, Play, FolderGit2, Bug, Zap } from "lucide-react";

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRepos().then(r => { setRepos(r); setLoading(false); });
  }, []);

  return (
    <PageLayout showFooter={false}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage and review your connected repositories.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Repositories" value={repos.length} icon={<FolderGit2 className="h-4 w-4" />} />
          <StatCard label="Total Bugs Found" value={42} icon={<Bug className="h-4 w-4" />} />
          <StatCard label="Avg. Score" value="82" icon={<Zap className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : repos.map(repo => (
                <div key={repo.id} className="rounded-xl border border-border bg-card p-5 card-hover flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link to={`/repo/${repo.id}`} className="text-base font-semibold text-foreground hover:text-primary transition-colors">{repo.name}</Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" /> {repo.branch}
                        {repo.language && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{repo.language}</span>}
                      </div>
                    </div>
                    <ScoreRing score={repo.score} size={50} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" /> Last scan: {new Date(repo.lastScan).toLocaleDateString()}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link to={`/repo/${repo.id}`} className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-foreground hover:bg-secondary transition-colors">Details</Link>
                    <Link to={`/review/${repo.id}`} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Play className="h-3 w-3" /> Scan
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </PageLayout>
  );
}
