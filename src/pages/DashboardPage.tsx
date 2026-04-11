import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { Repository } from "@/lib/types";
import { Link } from "react-router-dom";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { GitBranch, Clock, Play, FolderGit2, Bug, Zap, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBugs: 0, avgScore: 0, totalScans: 0 });
  const [scanningRepo, setScanningRepo] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      Promise.all([
        api.getRepos(),
        api.getStats()
      ]).then(([repoData, statsData]) => {
        setRepos(repoData);
        setStats(statsData);
        setLoading(false);
      });
    }
  }, [user]);

  const handleScan = async (repo: Repository) => {
    if (!repo.fullName) return;
    const [owner, repoName] = repo.fullName.split('/');
    if (!owner || !repoName) return;

    setScanningRepo(repo.fullName);
    try {
      const result = await api.scanRepo(owner, repoName);
      navigate(`/review/${owner}/${repoName}?scanId=${result.scanId}`);
    } catch (e: any) {
      const message = e?.message || 'Scan request failed.';
      if (e?.upgradeRequired) {
        toast.error(`${message} Upgrade to Pro for more scans.`);
      } else {
        toast.error(message);
      }
    } finally {
      setScanningRepo(null);
    }
  };

  if (authLoading) return <PageLayout showFooter={false}><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></PageLayout>;
  if (!user) return <Navigate to="/login" />;

  return (
    <PageLayout showFooter={false}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage and review your connected repositories.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Repositories" value={repos.length} icon={<FolderGit2 className="h-4 w-4" />} />
          <StatCard label="Total Bugs Found" value={stats.totalBugs} icon={<Bug className="h-4 w-4" />} />
          <StatCard label="Avg. Score" value={stats.avgScore} icon={<Zap className="h-4 w-4" />} />
        </div>

        {!loading && repos.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-xl bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-2">No repositories found</h2>
            <p className="text-sm text-muted-foreground">There are no repositories connected to your GitHub account.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : repos.map(repo => (
                  <div key={repo.fullName || repo.id} className="rounded-xl border border-border bg-card p-5 card-hover flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a href={repo.htmlUrl || `https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                            {repo.name}
                          </a>
                          {repo.private && <span className="shrink-0 text-[10px] border border-border rounded px-1.5 py-0.5 text-muted-foreground">Private</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {repo.language && <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{repo.language}</span>}
                          {repo.stars !== undefined && (
                            <span className="flex items-center gap-1 font-medium"><Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {repo.stars}</span>
                          )}
                        </div>
                      </div>
                      <ScoreRing score={repo.score} size={50} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" /> {repo.fullName}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <a href={repo.htmlUrl || `https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-foreground hover:bg-secondary transition-colors">GitHub</a>
                      <button
                        onClick={() => handleScan(repo)}
                        disabled={scanningRepo === repo.fullName}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {scanningRepo === repo.fullName ? <><Loader2 className="h-3 w-3 animate-spin" /> Starting...</> : <><Play className="h-3 w-3" /> Scan</>}
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
