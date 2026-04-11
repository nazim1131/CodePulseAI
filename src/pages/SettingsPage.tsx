import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Github, CreditCard, Sparkles, Loader2, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/mock-api";

export default function SettingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [strictness, setStrictness] = useState<"strict" | "balanced" | "lenient">("balanced");
  const [dark, setDark] = useState(true);
  
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    if (user) {
      api.getSubscription().then(data => {
        setSubscription(data);
        setLoadingSub(false);
      });
    }
  }, [user]);

  const handleUpgrade = async () => {
    try {
      setIsCheckoutLoading(true);
      const res = await api.createCheckoutSession('pro');
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initialize checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (authLoading) return <PageLayout showFooter={false}><div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></PageLayout>;
  if (!user) return <Navigate to="/login" />;

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
                <span className="text-sm text-muted-foreground">{user.githubConnected ? `Connected as ${user.name}` : "Not connected"}</span>
              </div>
              <button
                onClick={() => logout()}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${user.githubConnected ? "border border-border text-foreground hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                {user.githubConnected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Subscription Plan
            </h3>
            
            {loadingSub ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-foreground capitalize">{subscription?.plan || 'Free'} Plan</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${subscription?.plan === 'pro' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                        {subscription?.plan || 'FREE'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subscription?.plan === 'pro' 
                        ? 'Unlimited access to core features.' 
                        : 'Upgrade to pro to get more AI scans.'}
                    </p>
                  </div>

                  {subscription?.plan === 'pro' ? (
                    <button 
                      onClick={() => alert('Manage Subscription integration coming soon')}
                      className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      Manage
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={isCheckoutLoading}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isCheckoutLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Upgrade to Pro
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Scan Usage</span>
                    <span className="font-medium text-foreground">{Math.max(0, subscription?.scansUsed || 0)} / {subscription?.scanLimit || 50} scans</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${subscription?.plan === 'pro' ? 'bg-primary' : 'bg-muted-foreground/40'}`} 
                      style={{ width: `${Math.min(100, ((subscription?.scansUsed || 0) / (subscription?.scanLimit || 50)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
