import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { ScanRecord } from "@/lib/types";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { Clock, FileText } from "lucide-react";

export default function ScanHistoryPage() {
  const { repoId } = useParams();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory(repoId!).then(s => { setScans(s); setLoading(false); });
  }, [repoId]);

  return (
    <PageLayout showFooter={false}>
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Scan History</h1>
        <div className="space-y-3">
          {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />) :
            scans.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 card-hover">
                <div className="flex items-center gap-4">
                  <ScoreRing score={s.score} size={50} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{new Date(s.date).toLocaleDateString()} — {new Date(s.date).toLocaleTimeString()}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration}</span>
                      <span>{s.issuesFound} issues found</span>
                    </div>
                  </div>
                </div>
                <Link to={`/report/${s.repoId}`} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                  <FileText className="h-3 w-3" /> View Report
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </PageLayout>
  );
}
