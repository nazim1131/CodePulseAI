import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const username = params.get("username");

        if (!token) {
          console.warn("[AuthCallback] No token in URL — redirecting to login");
          navigate("/login", { replace: true });
          return;
        }

        // Persist token in both keys (mock-api.ts reads from both)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ token, username: username || "" }));

        // Clean token from URL bar without triggering a reload
        window.history.replaceState({}, document.title, "/auth/callback");

        // Verify token with backend and populate AuthContext
        await refreshUser();

        // Navigate using React Router — no page reload, no race condition
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("[AuthCallback] Error:", error);
        navigate("/login", { replace: true });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout showFooter={false}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Logging you in...</h2>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we redirect you.</p>
        </div>
      </div>
    </PageLayout>
  );
}
