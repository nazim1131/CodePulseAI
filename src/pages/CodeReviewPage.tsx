import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { Issue } from "@/lib/types";
import { IssueCard } from "@/components/shared/IssueCard";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { X, Bug, Zap, Lightbulb, Play, Loader2 } from "lucide-react";

export default function CodeReviewPage() {
  const { repoId } = useParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([api.getReviews(repoId!), api.getCodeContent()]).then(([r, c]) => {
      setIssues(r.issues); setCode(c); setLoading(false);
    });
  }, [repoId]);

  const handleScan = async () => {
    setScanning(true);
    await api.scanRepo(repoId!);
    const r = await api.getReviews(repoId!);
    setIssues(r.issues);
    setScanning(false);
  };

  const filteredIssues = filter === "all" ? issues : issues.filter(i => i.type === filter);
  const counts = { bug: issues.filter(i => i.type === "bug").length, performance: issues.filter(i => i.type === "performance").length, improvement: issues.filter(i => i.type === "improvement").length };

  const codeLines = code.split("\n");
  const issueLines = new Set(issues.map(i => i.line));

  return (
    <PageLayout showFooter={false}>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Code viewer */}
        <div className="flex-1 border-r border-border overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <span className="text-sm font-mono text-muted-foreground">src/components/Auth.tsx</span>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              {scanning ? "Scanning..." : "Run AI Scan"}
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-background font-mono text-sm">
            {loading ? (
              <div className="p-4 space-y-2">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="h-4 bg-muted rounded w-full animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />)}</div>
            ) : (
              <table className="w-full">
                <tbody>
                  {codeLines.map((line, i) => (
                    <tr key={i} className={`hover:bg-muted/30 ${issueLines.has(i + 1) ? "bg-red-500/10 border-l-2 border-primary" : ""}`}>
                      <td className="px-4 py-0.5 text-right text-muted-foreground select-none w-12 text-xs">{i + 1}</td>
                      <td className="px-4 py-0.5 whitespace-pre text-foreground text-xs">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Issues panel */}
        <div className="w-full lg:w-[420px] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-2">Issues & Suggestions</h3>
            <div className="flex gap-1 flex-wrap">
              {[
                { key: "all", label: "All", count: issues.length },
                { key: "bug", label: "Bugs", count: counts.bug, icon: Bug },
                { key: "performance", label: "Perf", count: counts.performance, icon: Zap },
                { key: "improvement", label: "Improve", count: counts.improvement, icon: Lightbulb },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {f.icon && <f.icon className="h-3 w-3" />} {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredIssues.length === 0 ? (
              <EmptyState type="no-issues" />
            ) : (
              filteredIssues.map((issue, i) => (
                <IssueCard key={i} issue={issue} onExplain={setSelectedIssue} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explanation Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelectedIssue(null)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl border border-border bg-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Senior Developer Explanation</h2>
              <button onClick={() => setSelectedIssue(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-primary">File</span>
                <p className="text-sm font-mono text-foreground">{selectedIssue.file}:{selectedIssue.line}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-primary">Problem</span>
                <p className="text-sm text-foreground">{selectedIssue.message}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-primary">Explanation</span>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedIssue.explanation}</div>
              </div>
              <div>
                <span className="text-xs font-medium text-primary">Suggested Fix</span>
                <pre className="mt-1 rounded-lg bg-muted p-3 text-xs font-mono text-foreground overflow-x-auto">{selectedIssue.suggestion}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
