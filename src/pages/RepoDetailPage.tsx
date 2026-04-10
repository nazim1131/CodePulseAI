import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { Repository, FileNode, Commit, ScanRecord } from "@/lib/types";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SkeletonLine } from "@/components/shared/Skeleton";
import { Folder, FileText, GitCommit, Play, Clock, ChevronRight } from "lucide-react";

const TreeNode = ({ node, depth = 0 }: { node: FileNode; depth?: number }) => {
  const [open, setOpen] = useState(depth < 1);
  return (
    <div>
      <button
        onClick={() => node.type === "folder" && setOpen(!open)}
        className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === "folder" ? (
          <>
            <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
            <Folder className="h-4 w-4 text-primary" />
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileText className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        <span className="text-foreground">{node.name}</span>
      </button>
      {open && node.children?.map(c => <TreeNode key={c.path} node={c} depth={depth + 1} />)}
    </div>
  );
};

export default function RepoDetailPage() {
  const { id } = useParams();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getRepo(id!),
      api.getFileTree(),
      api.getCommits(),
      api.getHistory(id!),
    ]).then(([r, t, c, s]) => {
      setRepo(r); setTree(t); setCommits(c); setScans(s); setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <PageLayout showFooter={false}>
      <div className="container py-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonLine key={i} className="h-6 w-full" />)}
      </div>
    </PageLayout>
  );

  return (
    <PageLayout showFooter={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{repo?.name}</h1>
            <p className="text-sm text-muted-foreground">{repo?.fullName}</p>
          </div>
          <div className="flex items-center gap-4">
            <ScoreRing score={repo?.score || 0} />
            <Link to={`/review/${id}`} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Play className="h-4 w-4" /> Run AI Scan
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* File tree */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">File Structure</h3>
            <div className="max-h-80 overflow-y-auto">
              {tree.map(n => <TreeNode key={n.path} node={n} />)}
            </div>
          </div>

          {/* Recent commits */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Commits</h3>
            <div className="space-y-3">
              {commits.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <GitCommit className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{c.message}</p>
                    <p className="text-xs text-muted-foreground">{c.author} · <span className="font-mono">{c.sha}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scan history */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Scan History</h3>
            <Link to={`/history/${id}`} className="text-xs text-primary hover:text-primary/80">View All →</Link>
          </div>
          <div className="space-y-2">
            {scans.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-foreground">{new Date(s.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{s.issuesFound} issues · {s.duration}</p>
                  </div>
                </div>
                <ScoreRing score={s.score} size={40} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
