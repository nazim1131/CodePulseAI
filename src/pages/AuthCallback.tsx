import { useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("token", token);
        
        // Also store inside 'user' key to prevent breaking existing API configs 
        try {
          const existingInfo = localStorage.getItem("user");
          const parsed = existingInfo ? JSON.parse(existingInfo) : {};
          localStorage.setItem("user", JSON.stringify({ ...parsed, token }));
        } catch (e) {
          localStorage.setItem("user", JSON.stringify({ token }));
        }
        
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Auth error:", error);
      window.location.href = "/";
    }
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
