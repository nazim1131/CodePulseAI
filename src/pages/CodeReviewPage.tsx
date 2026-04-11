import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { Issue } from "@/lib/types";
import { IssueCard } from "@/components/shared/IssueCard";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { X, Bug, Zap, Lightbulb, Loader2, AlertTriangle, CheckCircle2, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CodeReviewPage() {
  const { owner, repo, repoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scanId = searchParams.get("scanId");

  // Derive owner/repo from either the new route format or legacy repoId
  const repoOwner = owner;
  const repoName = repo;
  const displayName = repoOwner && repoName ? `${repoOwner}/${repoName}` : repoId || "";

  const [status, setStatus] = useState<"processing" | "completed" | "failed" | "no-scan">(
    scanId ? "processing" : "no-scan"
  );
  const [issues, setIssues] = useState<Issue[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [filter, setFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no scan and no context
  useEffect(() => {
    if (!scanId && !repoId) {
      navigate("/dashboard");
    }
  }, [scanId, repoId, navigate]);

  // Poll scan status
  useEffect(() => {
    if (!scanId) return;

    const poll = async () => {
      const data = await api.getScan(scanId);
      if (!data) return;

      if (data.status === "completed") {
        setStatus("completed");
        setIssues(data.issues || []);
        setScore(data.score || 0);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      } else if (data.status === "failed") {
        setStatus("failed");
        setErrorMsg(data.error || "Scan failed. Please try again.");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
      // else still 'processing', continue polling
    };

    // Immediate first check
    poll();

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(poll, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [scanId]);

  const filteredIssues = filter === "all" ? issues : issues.filter(i => i.type === filter);
  const counts = {
    bug: issues.filter(i => i.type === "bug").length,
    performance: issues.filter(i => i.type === "performance").length,
    improvement: issues.filter(i => i.type === "improvement").length
  };

  return (
    <PageLayout showFooter={false}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold text-foreground">{displayName}</h1>
              <p className="text-xs text-muted-foreground">AI Code Review</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === "processing" && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Scanning...
              </div>
            )}
            {status === "completed" && score !== null && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Score: {score}</span>
              </div>
            )}
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Processing / Failed / Completed state */}
          <div className="flex-1 flex flex-col">

            {status === "no-scan" && (
              <div className="flex flex-1 items-center justify-center text-center p-12">
                <div>
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">No active scan</h2>
                  <p className="text-sm text-muted-foreground mb-6">Start a scan from your dashboard to see code review results here.</p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center p-12">
                  <div className="relative mx-auto mb-6 h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                    <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bug className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Scanning Repository</h2>
                  <p className="text-sm text-muted-foreground mb-1">Fetching code from <span className="font-mono text-foreground">{displayName}</span></p>
                  <p className="text-xs text-muted-foreground">This may take 20–40 seconds for AI analysis...</p>
                  <div className="mt-6 flex gap-1 justify-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center p-12">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">Scan Failed</h2>
                  <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {status === "completed" && (
              <div className="flex-1 flex flex-col overflow-hidden lg:flex-row">
                {/* Summary panel */}
                <div className="p-6 border-b lg:border-b-0 lg:border-r border-border min-w-0 lg:w-1/3 overflow-auto">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Summary</h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-lg bg-card border border-border p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{counts.bug}</p>
                      <p className="text-xs text-muted-foreground mt-1">Bugs</p>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-500">{counts.performance}</p>
                      <p className="text-xs text-muted-foreground mt-1">Performance</p>
                    </div>
                    <div className="rounded-lg bg-card border border-border p-3 text-center">
                      <p className="text-2xl font-bold text-blue-500">{counts.improvement}</p>
                      <p className="text-xs text-muted-foreground mt-1">Improvements</p>
                    </div>
                  </div>
                  {score !== null && (
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Code Quality Score</p>
                      <p className="text-5xl font-black text-foreground">{score}</p>
                      <p className="text-xs text-muted-foreground mt-1">/ 100</p>
                    </div>
                  )}
                </div>

                {/* Issues list */}
                <div className="flex-1 flex flex-col overflow-hidden">
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
                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No issues found in this category</p>
                      </div>
                    ) : (
                      filteredIssues.map((issue, i) => (
                        <IssueCard key={i} issue={issue} onExplain={setSelectedIssue} />
                      ))
                    )}
                  </div>
                </div>
              </div>
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
                {typeof selectedIssue.explanation === 'string' ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedIssue.explanation}</div>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-3 mt-2">
                    <p><strong className="text-foreground">Why it exists:</strong> {selectedIssue.explanation.whyExists}</p>
                    <p><strong className="text-foreground">Real-world impact:</strong> {selectedIssue.explanation.realWorldImpact}</p>
                    <p><strong className="text-foreground">Best practice fix:</strong> {selectedIssue.explanation.bestPracticeFix}</p>
                  </div>
                )}
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
