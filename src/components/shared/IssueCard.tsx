import { Bug, Zap, Lightbulb } from "lucide-react";
import { Issue } from "@/lib/types";

const typeConfig = {
  bug: { icon: Bug, color: "text-red-400", bg: "bg-red-500/10", label: "Bug" },
  performance: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Performance" },
  improvement: { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/10", label: "Improvement" },
};

export const IssueCard = ({ issue, onExplain }: { issue: Issue; onExplain: (issue: Issue) => void }) => {
  const cfg = typeConfig[issue.type];
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-4 card-hover">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
          <Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-muted-foreground font-mono">{issue.file}:{issue.line}</span>
          </div>
          <p className="text-sm text-foreground mb-2">{issue.message}</p>
          <p className="text-xs text-muted-foreground mb-3">💡 {issue.suggestion}</p>
          <button
            onClick={() => onExplain(issue)}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Explain Like Senior Developer →
          </button>
        </div>
      </div>
    </div>
  );
};
