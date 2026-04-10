import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/lib/mock-api";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { StatCard } from "@/components/shared/StatCard";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { Bug, Zap, Lightbulb, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

export default function ReportPage() {
  const { repoId } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReport(repoId!).then(r => { setReport(r); setLoading(false); });
  }, [repoId]);

  if (loading) return (
    <PageLayout showFooter={false}>
      <div className="container py-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </PageLayout>
  );

  const trendData = report.trend.map((v: number, i: number) => ({ scan: `Scan ${i + 1}`, score: v }));
  const issueData = [
    { name: "Bugs", count: report.totalBugs, fill: "hsl(0 84% 60%)" },
    { name: "Performance", count: report.performanceIssues, fill: "hsl(45 90% 50%)" },
    { name: "Improvements", count: report.improvements, fill: "hsl(210 80% 60%)" },
  ];

  return (
    <PageLayout showFooter={false}>
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Report & Insights</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
            <ScoreRing score={report.score} />
            <div><p className="text-sm text-muted-foreground">Quality Score</p><p className="text-xl font-bold text-foreground">{report.score}/100</p></div>
          </div>
          <StatCard label="Total Bugs" value={report.totalBugs} icon={<Bug className="h-4 w-4" />} />
          <StatCard label="Performance Issues" value={report.performanceIssues} icon={<Zap className="h-4 w-4" />} />
          <StatCard label="Improvements" value={report.improvements} icon={<Lightbulb className="h-4 w-4" />} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Score Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <XAxis dataKey="scan" tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ fill: "hsl(0 84% 60%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Issues Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={issueData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)", borderRadius: "8px", fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
