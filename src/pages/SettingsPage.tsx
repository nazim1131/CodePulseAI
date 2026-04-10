import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Github, Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const [connected, setConnected] = useState(true);
  const [strictness, setStrictness] = useState<"strict" | "balanced" | "lenient">("balanced");
  const [dark, setDark] = useState(true);

  return (
    <PageLayout showFooter={false}>
      <div className="container max-w-2xl py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="space-y-6">
          {/* GitHub */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">GitHub Connection</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-foreground" />
                <span className="text-sm text-muted-foreground">{connected ? "Connected as alex-morgan" : "Not connected"}</span>
              </div>
              <button
                onClick={() => setConnected(!connected)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${connected ? "border border-border text-foreground hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                {connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>

          {/* AI Preferences */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">AI Review Strictness</h3>
            <div className="flex gap-2">
              {(["strict", "balanced", "lenient"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStrictness(s)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${strictness === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Theme</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{dark ? "Dark mode" : "Light mode"}</span>
              <button onClick={() => setDark(!dark)} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground">
                {dark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                {dark ? "Dark" : "Light"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
