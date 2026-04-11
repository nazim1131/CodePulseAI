// AI service — Groq only (llama3-70b-8192)
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a STRICT senior software engineer doing a deep, uncompromising code review.

Analyze the provided repository code and identify ALL of the following:
1. Bugs (logic errors, null references, broken async/error handling)
2. Performance issues (redundant renders, O(n²) loops, missing memoization, large bundles)
3. UI/UX issues — VERY IMPORTANT (non-responsive design, no mobile breakpoints, poor accessibility, bad layout)
4. Code quality issues (magic numbers, unclear naming, duplicated logic, missing types, dead code)
5. Security issues (XSS, missing input validation, exposed secrets, insecure headers)

CRITICAL RULES — YOU MUST FOLLOW THESE:
- NEVER return an empty issues array
- ALWAYS find at minimum 5 issues, preferably 8-12
- Be as critical as a demanding principal engineer — small issues count
- If CSS/styling is missing or non-responsive → it is an issue
- If no error boundaries exist → it is an issue
- If variable names are unclear → it is an issue
- If async calls have no loading/error states → it is an issue
- Score MUST reflect quality: many/severe issues → low score (30-60), few minor issues → high score (70-90)
- NEVER give a score above 95 unless the code is absolutely flawless

Return ONLY a valid JSON object. No markdown. No explanation outside JSON. No code fences.

The JSON must follow this EXACT schema:
{
  "score": <number 0-100 representing overall code quality>,
  "totalBugs": <number of bugs found>,
  "performanceIssues": <number of performance issues>,
  "improvements": <number of improvement suggestions>,
  "issues": [
    {
      "file": "<filename>",
      "line": <line number or 1 if unknown>,
      "type": "<bug | performance | improvement>",
      "severity": "<low | medium | high>",
      "confidenceScore": <0-100>,
      "message": "<concise description of the issue>",
      "suggestion": "<specific actionable fix>",
      "explanation": {
        "whyExists": "<root cause>",
        "realWorldImpact": "<production impact>",
        "bestPracticeFix": "<industry best practice>"
      }
    }
  ]
}

Return ONLY the raw JSON object, nothing else.`;

// ─── JSON extraction ──────────────────────────────────────────────────────────
const extractJSON = (text) => {
  console.log("[AI RAW RESPONSE]:", text.substring(0, 600), "...");

  // Strip markdown code fences if present
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // Extract outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (e) {
    console.error("[AI] Invalid JSON from Groq:", cleaned.substring(0, 300));
    throw new Error("AI response parsing failed");
  }

  return result;
};

// ─── Normalize result ─────────────────────────────────────────────────────────
const normalizeResult = (parsed) => {
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

  const derivedScore =
    typeof parsed.score === "number"
      ? parsed.score
      : Math.max(40, 100 - issues.length * 5);

  return {
    score: Math.max(20, Math.min(100, derivedScore)),
    totalBugs: parsed.totalBugs ?? issues.filter((i) => i.type === "bug").length,
    performanceIssues:
      parsed.performanceIssues ??
      issues.filter((i) => i.type === "performance").length,
    improvements:
      parsed.improvements ??
      issues.filter((i) => i.type === "improvement").length,
    issues,
  };
};

// ─── Mock data (no API key in dev) ───────────────────────────────────────────
const getMockResult = () => ({
  score: 72,
  totalBugs: 3,
  performanceIssues: 2,
  improvements: 3,
  issues: [
    {
      file: "src/main.js", line: 12, type: "bug", severity: "high", confidenceScore: 92,
      message: "Potential null reference on optional chaining",
      suggestion: "Use optional chaining: `user?.profile?.avatar`",
      explanation: {
        whyExists: "Accessing deeply nested properties without null checks.",
        realWorldImpact: "Crashes UI when API returns incomplete data.",
        bestPracticeFix: "Always use `?.` for uncertain nested property access."
      }
    },
    {
      file: "src/utils.js", line: 45, type: "performance", severity: "medium", confidenceScore: 85,
      message: "O(n²) nested loop complexity",
      suggestion: "Replace inner loop with a Set for O(1) lookup: `const set = new Set(arr)`",
      explanation: {
        whyExists: "Nested array iteration without data structure optimization.",
        realWorldImpact: "Causes UI lag with datasets > 500 items.",
        bestPracticeFix: "Use a Set or Map to reduce lookup complexity to O(1)."
      }
    },
    {
      file: "src/api.js", line: 23, type: "bug", severity: "medium", confidenceScore: 80,
      message: "Missing error handling in async function",
      suggestion: "Wrap fetch calls in try/catch and handle network errors explicitly",
      explanation: {
        whyExists: "Unhandled Promise rejections in async API calls.",
        realWorldImpact: "Silent failures that are hard to debug in production.",
        bestPracticeFix: "Always add try/catch to async functions that make network requests."
      }
    },
    {
      file: "src/components/List.jsx", line: 67, type: "improvement", severity: "low", confidenceScore: 75,
      message: "Missing key prop in list render",
      suggestion: "Add a stable unique key: `<Item key={item.id} />`",
      explanation: {
        whyExists: "React list rendering without unique keys.",
        realWorldImpact: "Causes unnecessary re-renders and reconciliation bugs.",
        bestPracticeFix: "Always use a unique stable ID (not array index) as the key prop."
      }
    },
    {
      file: "src/styles/main.css", line: 1, type: "improvement", severity: "medium", confidenceScore: 78,
      message: "No responsive breakpoints defined",
      suggestion: "Add @media queries for mobile (max-width: 768px) and tablet (max-width: 1024px)",
      explanation: {
        whyExists: "CSS written only for desktop viewport.",
        realWorldImpact: "Broken layout on mobile devices affecting ~60% of users.",
        bestPracticeFix: "Use mobile-first CSS with min-width breakpoints."
      }
    }
  ]
});

// ─── Main entry point ─────────────────────────────────────────────────────────
const analyzeCode = async (filesContentString) => {
  // No API key → return mock data for local dev
  if (!process.env.GROQ_API_KEY) {
    console.log("[AI] GROQ_API_KEY not set, returning mock data");
    return new Promise((resolve) => setTimeout(() => resolve(getMockResult()), 1500));
  }

  if (!filesContentString || !filesContentString.trim()) {
    throw new Error("No code content was provided for analysis");
  }

  // Cap at 30k chars to stay within Groq context limits
  const code = filesContentString.substring(0, 30000);

  console.log("[AI] Sending code to Groq llama3-70b-8192 ...");

  try {
    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this code:\n\n${code}` }
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const text = response.choices[0].message.content;
    const parsed = extractJSON(text);

    if (!parsed || !Array.isArray(parsed.issues) || parsed.issues.length === 0) {
      throw new Error("Groq returned empty issues — invalid analysis");
    }

    const result = normalizeResult(parsed);
    console.log(`[AI] Groq success: score=${result.score}, issues=${result.issues.length}`);
    return result;

  } catch (err) {
    console.error("[AI] Groq error:", err.message);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
};

module.exports = { analyzeCode };
