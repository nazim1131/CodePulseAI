import { Repository, ReviewResponse, ScanRecord, User, FileNode, Commit } from "./types";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const mockUser: User = {
  id: "u1",
  name: "Alex Morgan",
  email: "alex@devteam.io",
  avatar: "",
  plan: "pro",
  scansRemaining: 187,
  scansTotal: 250,
  githubConnected: true,
};

export const mockRepos: Repository[] = [
  { id: "r1", name: "frontend-app", fullName: "alex/frontend-app", lastScan: "2026-04-09T14:30:00Z", score: 87, language: "TypeScript", branch: "main" },
  { id: "r2", name: "api-service", fullName: "alex/api-service", lastScan: "2026-04-08T10:15:00Z", score: 72, language: "Python", branch: "develop" },
  { id: "r3", name: "ml-pipeline", fullName: "alex/ml-pipeline", lastScan: "2026-04-07T08:00:00Z", score: 91, language: "Python", branch: "main" },
  { id: "r4", name: "mobile-client", fullName: "alex/mobile-client", lastScan: "2026-04-05T16:45:00Z", score: 65, language: "Dart", branch: "main" },
  { id: "r5", name: "infra-config", fullName: "alex/infra-config", lastScan: "2026-04-04T12:00:00Z", score: 94, language: "YAML", branch: "main" },
];

export const mockReview: ReviewResponse = {
  issues: [
    { file: "src/components/Auth.tsx", line: 45, type: "bug", message: "Potential null reference when accessing user.token without null check", suggestion: "Add optional chaining: user?.token", explanation: "When the authentication response is delayed or fails, the user object may be undefined. Accessing .token directly will throw a TypeError at runtime, crashing the component. This is a common React anti-pattern that leads to white-screen errors in production.\n\n**Why it's bad:** Uncaught TypeErrors break the entire React component tree. Users see a blank page with no helpful error message.\n\n**Best practice:** Always use optional chaining (?.) or nullish coalescing (??) when accessing properties on objects that may be null/undefined. Wrap auth-dependent components in proper loading/error states." },
    { file: "src/utils/api.ts", line: 23, type: "performance", message: "Unnecessary re-renders caused by inline object creation in useEffect dependency", suggestion: "Memoize the config object with useMemo", explanation: "Creating a new object literal inside a render function means React's shallow comparison will always detect a 'change', triggering the useEffect on every render cycle. This causes unnecessary API calls and re-renders.\n\n**Why it's bad:** Performance degrades exponentially as component complexity grows. Each re-render triggers cascading updates in child components.\n\n**Best practice:** Use useMemo() to memoize objects used as dependencies." },
    { file: "src/hooks/useData.ts", line: 67, type: "improvement", message: "Missing error boundary for async data fetching", suggestion: "Wrap with try-catch and add error state handling", explanation: "The async function lacks proper error handling. If the API call fails, the error silently disappears and the UI shows stale data or an infinite loading state.\n\n**Why it's bad:** Users have no feedback when something goes wrong. Silent failures make debugging extremely difficult.\n\n**Best practice:** Always wrap async operations in try-catch, update error state, and provide user-facing error messages." },
    { file: "src/components/Dashboard.tsx", line: 112, type: "bug", message: "Race condition in state update after unmounted component", suggestion: "Add cleanup function with AbortController", explanation: "If the component unmounts before the API call resolves, React will attempt to update state on an unmounted component, causing a memory leak warning.\n\n**Why it's bad:** Memory leaks accumulate over time and degrade app performance.\n\n**Best practice:** Use AbortController to cancel pending requests on cleanup." },
    { file: "src/styles/theme.css", line: 8, type: "improvement", message: "Hardcoded color values instead of CSS variables", suggestion: "Use CSS custom properties for theming consistency", explanation: "Hardcoded hex colors make theme changes require updating dozens of files. CSS variables enable centralized theme management.\n\n**Best practice:** Define all colors as CSS custom properties in :root." },
    { file: "src/utils/helpers.ts", line: 89, type: "performance", message: "O(n²) complexity in array filtering logic", suggestion: "Use a Set or Map for O(n) lookup", explanation: "The nested .filter().includes() pattern creates quadratic time complexity. For large datasets, this causes noticeable UI lag.\n\n**Best practice:** Convert the lookup array to a Set for O(1) membership testing." },
  ],
};

export const mockScans: ScanRecord[] = [
  { id: "s1", repoId: "r1", date: "2026-04-09T14:30:00Z", score: 87, issuesFound: 6, duration: "2m 34s" },
  { id: "s2", repoId: "r1", date: "2026-04-07T10:00:00Z", score: 82, issuesFound: 9, duration: "2m 12s" },
  { id: "s3", repoId: "r1", date: "2026-04-05T08:15:00Z", score: 78, issuesFound: 14, duration: "3m 01s" },
  { id: "s4", repoId: "r1", date: "2026-04-02T16:30:00Z", score: 74, issuesFound: 18, duration: "2m 45s" },
  { id: "s5", repoId: "r1", date: "2026-03-30T12:00:00Z", score: 69, issuesFound: 22, duration: "3m 15s" },
];

export const mockFileTree: FileNode[] = [
  { name: "src", type: "folder", path: "src", children: [
    { name: "components", type: "folder", path: "src/components", children: [
      { name: "Auth.tsx", type: "file", path: "src/components/Auth.tsx" },
      { name: "Dashboard.tsx", type: "file", path: "src/components/Dashboard.tsx" },
      { name: "Header.tsx", type: "file", path: "src/components/Header.tsx" },
    ]},
    { name: "hooks", type: "folder", path: "src/hooks", children: [
      { name: "useData.ts", type: "file", path: "src/hooks/useData.ts" },
      { name: "useAuth.ts", type: "file", path: "src/hooks/useAuth.ts" },
    ]},
    { name: "utils", type: "folder", path: "src/utils", children: [
      { name: "api.ts", type: "file", path: "src/utils/api.ts" },
      { name: "helpers.ts", type: "file", path: "src/utils/helpers.ts" },
    ]},
    { name: "styles", type: "folder", path: "src/styles", children: [
      { name: "theme.css", type: "file", path: "src/styles/theme.css" },
    ]},
    { name: "App.tsx", type: "file", path: "src/App.tsx" },
    { name: "main.tsx", type: "file", path: "src/main.tsx" },
  ]},
  { name: "public", type: "folder", path: "public", children: [
    { name: "index.html", type: "file", path: "public/index.html" },
  ]},
  { name: "package.json", type: "file", path: "package.json" },
  { name: "tsconfig.json", type: "file", path: "tsconfig.json" },
];

export const mockCommits: Commit[] = [
  { id: "c1", message: "fix: resolve auth token refresh loop", author: "Alex Morgan", date: "2026-04-09T14:00:00Z", sha: "a3f2c1d" },
  { id: "c2", message: "feat: add dark mode support", author: "Alex Morgan", date: "2026-04-08T11:30:00Z", sha: "b7e4f2a" },
  { id: "c3", message: "refactor: extract API utility functions", author: "Jamie Chen", date: "2026-04-07T09:15:00Z", sha: "c9d1e3b" },
  { id: "c4", message: "perf: optimize dashboard rendering", author: "Alex Morgan", date: "2026-04-06T16:45:00Z", sha: "d2a5f7c" },
  { id: "c5", message: "fix: handle edge case in data parsing", author: "Sam Rivera", date: "2026-04-05T13:00:00Z", sha: "e8b3c4d" },
];

export const mockCodeContent = `import { useState, useEffect } from 'react';
import { fetchUserData } from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  token: string;
}

export const Auth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = await fetchUserData(config);
      setUser(response.data);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('session');
    setUser(null);
  };

  return (
    <div className="auth-container">
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="user-info">
          <h2>{user.name}</h2>
          <p>Token: {user.token}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};`;

// Mock API functions
export const api = {
  authGithub: async () => { await delay(800); return { success: true, user: mockUser }; },
  getRepos: async () => { await delay(600); return mockRepos; },
  getRepo: async (id: string) => { await delay(400); return mockRepos.find(r => r.id === id) || mockRepos[0]; },
  scanRepo: async (_id: string) => { await delay(2000); return { success: true, scanId: "s_new" }; },
  getReviews: async (_repoId: string) => { await delay(500); return mockReview; },
  getHistory: async (_repoId: string) => { await delay(400); return mockScans; },
  getReport: async (_repoId: string) => { await delay(500); return { score: 87, totalBugs: 6, performanceIssues: 2, improvements: 4, trend: [69, 74, 78, 82, 87] }; },
  getFileTree: async () => { await delay(300); return mockFileTree; },
  getCommits: async () => { await delay(300); return mockCommits; },
  getCodeContent: async () => { await delay(200); return mockCodeContent; },
};
