import { PageLayout } from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { Github, Zap, Shield, BarChart3, ArrowRight, Code2, Star, LayoutDashboard } from "lucide-react";
import { RevealOnScroll } from "@/hooks/useScrollReveal";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: Shield, title: "AI Bug Detection", desc: "Automatically detect bugs, security vulnerabilities, and anti-patterns in your codebase." },
  { icon: Zap, title: "Smart Suggestions", desc: "Get actionable improvement suggestions with code snippets you can copy and paste." },
  { icon: BarChart3, title: "Performance Optimization", desc: "Identify performance bottlenecks and get optimization recommendations." },
];

const steps = [
  { num: "01", title: "Connect GitHub", desc: "Link your GitHub account and select repositories to review." },
  { num: "02", title: "Run AI Scan", desc: "Our AI analyzes your code for bugs, performance issues, and improvements." },
  { num: "03", title: "Review & Fix", desc: "Get detailed explanations and apply suggested fixes directly." },
];

const stats = [
  { value: "3M+", label: "Lines Scanned" },
  { value: "95%", label: "Bug Detection Rate" },
  { value: "88%", label: "Developer Satisfaction" },
  { value: "120+", label: "Teams Trust Us" },
];

export default function LandingPage() {
  const { user } = useAuth();
  const authLink = user ? "/dashboard" : "/login";
  
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl">
            <RevealOnScroll delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
                <Zap className="h-3 w-3" /> AI-Powered Code Reviews
              </div>
            </RevealOnScroll>
            <RevealOnScroll delay={100}>
              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-7xl leading-[1.1] mb-6">
                Your AI<br />
                <span className="text-gradient">CodePulse</span><br />
                Team On Demand
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                From bug detection to performance optimization, we scan your codebase and deliver actionable insights your team can trust.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={300}>
              <div className="flex flex-wrap gap-3">
                <Link to={authLink} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  {user ? <><LayoutDashboard className="h-4 w-4" /> Go to Dashboard</> : <><Github className="h-4 w-4" /> Login with GitHub</>}
                </Link>
                <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                  View Pricing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <RevealOnScroll key={s.label} delay={i * 100}>
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-20">
        <RevealOnScroll className="container text-center max-w-3xl">
          <p className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed">
            We <span className="text-gradient">design and deploy</span> AI-powered code review solutions with developers at the core, ensuring every <span className="text-gradient">system enhances</span> real development experiences.
          </p>
        </RevealOnScroll>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <RevealOnScroll className="text-center mb-12">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mb-3"><Code2 className="h-3 w-3" /> Features</span>
            <h2 className="text-3xl font-bold text-foreground">End-to-End AI Code Review</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <RevealOnScroll key={f.title} delay={i * 120}>
                <div className="rounded-xl border border-border bg-card p-6 card-hover">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>
          </RevealOnScroll>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <RevealOnScroll key={s.num} delay={i * 150}>
                <div className="relative">
                  <span className="text-5xl font-black text-primary/20">{s.num}</span>
                  <h3 className="text-xl font-semibold text-foreground mt-2 mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6">
            <RevealOnScroll direction="left">
              <div className="rounded-xl border border-border bg-card p-8">
                <p className="text-sm text-muted-foreground mb-2">Available for worldwide projects</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">Trusted by <span className="text-gradient">120+</span> teams</h3>
                <p className="text-muted-foreground text-sm mb-4">Across 4 industries — shipping AI code reviews from idea to production in days.</p>
                <Link to={authLink} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  {user ? "Go to Dashboard" : "Start a Project"}
                </Link>
              </div>
            </RevealOnScroll>
            <RevealOnScroll direction="right">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
                <p className="text-3xl font-black text-foreground mb-4">120+</p>
                <blockquote className="text-sm text-muted-foreground italic mb-4">"Good AI code review feels obvious — because the hard work is hidden."</blockquote>
                <p className="text-sm font-medium text-foreground">Ava Collins <span className="text-muted-foreground">| Engineering Lead</span></p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border">
        <RevealOnScroll className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to ship better code?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Connect your GitHub and get your first AI code review in under 2 minutes.</p>
          <Link to={authLink} className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors animate-pulse-glow">
            {user ? <><LayoutDashboard className="h-4 w-4" /> Go to Dashboard</> : <><Github className="h-4 w-4" /> Login with GitHub</>}
          </Link>
        </RevealOnScroll>
      </section>
    </PageLayout>
  );
}
