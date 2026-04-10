import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">AI</span>
            </div>
            <span className="text-lg font-bold text-foreground">CodeReview</span>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered code reviews that catch bugs before your users do.</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Product</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/pricing" className="block hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/dashboard" className="block hover:text-foreground transition-colors">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <span className="block">About</span>
            <span className="block">Blog</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Legal</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <span className="block">Privacy</span>
            <span className="block">Terms</span>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © 2026 CodeReview AI. All rights reserved.
      </div>
    </div>
  </footer>
);
