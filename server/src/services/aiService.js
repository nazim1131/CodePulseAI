// AI service using Google Gemini for code analysis
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Build a strict prompt that forces real JSON output with deep critical analysis
const buildPrompt = (code) => `You are a STRICT senior software engineer doing a deep, uncompromising code review.

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

Return ONLY the raw JSON object, nothing else.

Code to analyze:
${code}`;

// Clean raw AI text and extract JSON
const extractJSON = (text) => {
  console.log("[AI RAW RESPONSE]:", text.substring(0, 300), "...");

  // Remove markdown fences
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned);
};

// Normalize AI output to ensure required fields always exist
const normalizeResult = (parsed) => {
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

  // Enforce minimum realistic score: more issues = lower score, but never below 20
  const derivedScore = typeof parsed.score === "number"
    ? parsed.score
    : Math.max(40, 100 - (issues.length * 5));

  return {
    score: Math.max(20, Math.min(100, derivedScore)),
    totalBugs: parsed.totalBugs ?? issues.filter(i => i.type === "bug").length,
    performanceIssues: parsed.performanceIssues ?? issues.filter(i => i.type === "performance").length,
    improvements: parsed.improvements ?? issues.filter(i => i.type === "improvement").length,
    issues
  };
};

const analyzeCode = async (filesContentString) => {
  // No API key — return realistic mock data for local dev
  if (!process.env.GEMINI_API_KEY) {
    console.log("[AI] No API key found, returning mock data");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
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
            }
          ]
        });
      }, 1500);
    });
  }

  if (!filesContentString || !filesContentString.trim()) {
    console.warn("[AI] Empty code string provided, cannot analyze");
    throw new Error("No code content was provided for analysis");
  }

  const prompt = buildPrompt(filesContentString.substring(0, 30000));

  // Only confirmed available models for this API key (gemini 1.5 variants return 404)
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("[AI RAW RESPONSE]:", text.substring(0, 600), "...");

      let parsed;
      try {
        parsed = extractJSON(text);
      } catch (parseErr) {
        console.error(`[AI] JSON parse failed for ${modelName}:`, parseErr.message);
        console.error("[AI] Raw text was:", text.substring(0, 500));
        continue;
      }

      if (!parsed || (!parsed.issues?.length && !parsed.bugs?.length)) {
        console.warn(`[AI] ${modelName} returned empty/invalid analysis, trying next model`);
        continue;
      }

      // Strict enforcement: AI must return issues
      if (Array.isArray(parsed.issues) && parsed.issues.length === 0) {
        console.warn(`[AI] ${modelName} returned 0 issues — rejecting and trying next model`);
        continue;
      }

      // Handle alternative format { bugs: [], improvements: [], performance: [] }
      if (!parsed.issues && (parsed.bugs || parsed.improvements || parsed.performance)) {
        parsed.issues = [
          ...(parsed.bugs || []).map(b => ({ ...b, type: "bug", message: b.issue || b.message, suggestion: b.fix || b.suggestion || "" })),
          ...(parsed.improvements || []).map(i => ({ ...i, type: "improvement", message: i.suggestion || i.message, line: i.line || 1 })),
          ...(parsed.performance || []).map(p => ({ ...p, type: "performance", message: p.issue || p.message, line: p.line || 1 }))
        ];
      }

      const normalized = normalizeResult(parsed);
      console.log(`[AI] Success with ${modelName}: score=${normalized.score}, issues=${normalized.issues.length}`);
      return normalized;

    } catch (err) {
      if (err.message.includes("429")) {
        console.warn(`[AI] ${modelName}: Free tier quota exceeded for today. The Gemini API daily limit has been reached. Scans will use mock data until quota resets (usually midnight Pacific Time).`);
      } else {
        console.error(`[AI] Model ${modelName} failed:`, err.message);
      }
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("[AI] All models failed. Throwing error.");
        const isQuotaError = err.message.includes("429");
        throw new Error(
          isQuotaError
            ? "Gemini API free tier daily quota exceeded. Quota resets at midnight Pacific Time."
            : `AI analysis failed: ${err.message}`
        );
      }
    }
  }
};

module.exports = { analyzeCode };
