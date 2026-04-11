import { PageLayout } from "@/components/layout/PageLayout";
import { Github } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">AI</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue to CodePulse AI</p>
          </div>

          <button 
            onClick={() => { window.location.href = "/api/auth/github"; }}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-foreground text-background px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity mb-4"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
