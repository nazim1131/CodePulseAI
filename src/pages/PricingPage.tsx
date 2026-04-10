import { PageLayout } from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "For individual developers",
    features: ["5 scans/month", "1 repository", "Basic bug detection", "Community support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    desc: "For professional developers",
    features: ["250 scans/month", "Unlimited repositories", "Advanced AI analysis", "Performance insights", "Priority support", "Export reports"],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    desc: "For development teams",
    features: ["Unlimited scans", "Unlimited repos", "Team dashboard", "CI/CD integration", "Custom rules", "Dedicated support", "SSO & SAML"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <PageLayout>
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map(p => (
              <div key={p.name} className={`rounded-2xl border p-6 flex flex-col ${p.popular ? "border-primary glow-red bg-card" : "border-border bg-card"}`}>
                {p.popular && <span className="inline-block self-start rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground mb-3">Most Popular</span>}
                <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                <p className="text-4xl font-black text-foreground mb-1">{p.price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                <ul className="my-6 space-y-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`block text-center rounded-xl py-2.5 text-sm font-semibold transition-colors ${p.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border text-foreground hover:bg-secondary"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
