import { Inbox, Search, AlertCircle } from "lucide-react";

interface Props {
  type: "no-repos" | "no-issues" | "no-data";
  title?: string;
  message?: string;
}

const configs = {
  "no-repos": { icon: Inbox, title: "No repositories connected", message: "Connect your GitHub account to start reviewing code." },
  "no-issues": { icon: Search, title: "No issues found", message: "Your code looks clean! No issues detected in the latest scan." },
  "no-data": { icon: AlertCircle, title: "No data available", message: "Run a scan to generate insights and reports." },
};

export const EmptyState = ({ type, title, message }: Props) => {
  const cfg = configs[type];
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title || cfg.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message || cfg.message}</p>
    </div>
  );
};
