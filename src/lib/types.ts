export interface Repository {
  id: string;
  name: string;
  lastScan: string;
  score: number;
  language?: string;
  branch?: string;
  fullName?: string;
}

export interface Issue {
  file: string;
  line: number;
  type: "bug" | "performance" | "improvement";
  message: string;
  suggestion: string;
  explanation: string;
}

export interface ReviewResponse {
  issues: Issue[];
}

export interface ScanRecord {
  id: string;
  repoId: string;
  date: string;
  score: number;
  issuesFound: number;
  duration: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro" | "team";
  scansRemaining: number;
  scansTotal: number;
  githubConnected: boolean;
}

export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  path: string;
}

export interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  sha: string;
}
