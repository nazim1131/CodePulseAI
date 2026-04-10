import { PageLayout } from "@/components/layout/PageLayout";
import { mockUser } from "@/lib/mock-api";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { User, Crown, BarChart3 } from "lucide-react";

export default function ProfilePage() {
  const u = mockUser;
  const usagePercent = Math.round((u.scansRemaining / u.scansTotal) * 100);

  return (
    <PageLayout showFooter={false}>
      <div className="container max-w-2xl py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

        <div className="space-y-6">
          {/* User info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Subscription Plan</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium capitalize">{u.plan} Plan</span>
              <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">Active</span>
            </div>
          </div>

          {/* Usage */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Usage Stats</h3>
            </div>
            <div className="flex items-center gap-6">
              <ScoreRing score={usagePercent} size={70} />
              <div>
                <p className="text-sm text-foreground"><strong>{u.scansRemaining}</strong> of {u.scansTotal} scans remaining</p>
                <p className="text-xs text-muted-foreground mt-1">Resets monthly on your billing date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
