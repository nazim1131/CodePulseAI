import { Repository, ReviewResponse, ScanRecord, User, FileNode, Commit } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  let token = localStorage.getItem('token') || '';
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { token = JSON.parse(userStr).token; } catch (e) {}
    }
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const api = {
  getMe: async (): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: data.id,
        name: data.username,
        email: data.email || "",
        avatar: data.avatar || "",
        plan: data.plan || "free",
        scansRemaining: data.scansRemaining || 0,
        scansTotal: data.scansTotal || 0,
        githubConnected: !!data.githubId
      };
    } catch {
      return null;
    }
  },
  authGithub: async (code?: string): Promise<{ success: boolean, user: any }> => {
    try {
      // simulate oauth code flow, but our backend accepts "mock_code" for local testing
      const res = await fetch(`${API_BASE_URL}/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code || 'mock_code' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Store user token
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true, user: data };
    } catch (e) {
      console.error(e);
      return { success: false, user: null };
    }
  },

  getRepos: async (): Promise<Repository[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/repos`, { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((r: any) => ({
        id: r._id || r.full_name,
        name: r.name,
        fullName: r.full_name,
        lastScan: r.lastScan || new Date().toISOString(),
        score: r.score || 0,
        language: r.language || 'Unknown',
        branch: r.branch || 'main',
        stars: r.stargazers_count || 0,
        htmlUrl: r.html_url,
        private: r.private
      }));
    } catch {
      return [];
    }
  },

  getStats: async (): Promise<{ totalBugs: number; avgScore: number; totalScans: number }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`, { headers: getHeaders() });
      if (!res.ok) return { totalBugs: 0, avgScore: 0, totalScans: 0 };
      return await res.json();
    } catch {
      return { totalBugs: 0, avgScore: 0, totalScans: 0 };
    }
  },

  getRepo: async (id: string): Promise<Repository | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/repos/${id}`, { headers: getHeaders() });
      if (!res.ok) return null;
      const r = await res.json();
      return {
        id: r._id,
        name: r.name,
        fullName: r.fullName,
        lastScan: r.lastScan || new Date().toISOString(),
        score: r.score,
        language: r.language || 'Unknown',
        branch: r.branch || 'main'
      };
    } catch {
      return null;
    }
  },

  scanRepo: async (owner: string, repo: string): Promise<{ success: boolean; scanId: string }> => {
    const headers = getHeaders();
    const res = await fetch(`${API_BASE_URL}/scan`, { 
      method: 'POST',
      headers,
      body: JSON.stringify({ owner, repo })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Scan failed') as any;
      err.upgradeRequired = data.upgradeRequired || false;
      err.status = res.status;
      throw err;
    }
    return { success: true, scanId: data.scanId };
  },

  getScan: async (scanId: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/scan/${scanId}`, { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getReviews: async (repoId: string): Promise<ReviewResponse | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${repoId}`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        issues: data.issues || []
      };
    } catch {
      return { issues: [] };
    }
  },

  getHistory: async (repoId: string): Promise<ScanRecord[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/history/${repoId}`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  getReport: async (repoId: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/report/${repoId}`, { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getSubscription: async (): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/subscription`, { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createCheckoutSession: async (plan: string = 'pro'): Promise<{ url: string }> => {
    const res = await fetch(`${API_BASE_URL}/billing/checkout`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan })
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'Checkout failed') as any;
      err.missingConfig = !!data.missingConfig;
      err.status = res.status;
      throw err;
    }

    return data;
  },

  // Mocked out methods for Tree/Commits to prevent over-complicating without auth proxy setup
  getFileTree: async (): Promise<FileNode[]> => { 
    return [
      { name: "src", type: "folder", path: "src", children: [
        { name: "main.js", type: "file", path: "src/main.js" },
      ]}
    ];
  },
  getCommits: async (): Promise<Commit[]> => {
    return [
      { id: "c1", message: "fix: mock integration", author: "Dev", date: new Date().toISOString(), sha: "1a2b3c" }
    ];
  },
  getCodeContent: async (): Promise<string> => {
    return `// Code from GitHub...`;
  },
};
