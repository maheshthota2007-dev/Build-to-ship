import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";
import type { AIAnalysis, Mission } from "@workspace/db";
import { logger } from "./logger";

const analysisSchema = z.object({
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  score: z.number().int().min(0).max(100),
  correctFindings: z.array(z.string()).max(8),
  missedFindings: z.array(z.string()).max(8),
  explanation: z.string().min(1).max(1200),
  recommendations: z.array(z.string()).min(1).max(6),
  nextRecommendedTopic: z.string().min(1).max(100),
  encouragement: z.string().min(1).max(300),
});

const mentorSchema = z.object({
  answer: z.string().min(1).max(5000),
  safetyRedirect: z.boolean(),
  topic: z.string().min(1).max(80),
});

export type MentorAnswer = z.infer<typeof mentorSchema>;

function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey });
}

function parseJson(text: string | undefined): unknown {
  if (!text) throw new Error("Gemini returned an empty response");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Gemini response was not JSON");
  return JSON.parse(text.slice(start, end + 1));
}

const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];

export async function analyzeMission(input: {
  mission: Mission;
  assessment: string;
  findings: string[];
  score: number;
  correctFindings: string[];
  missedFindings: string[];
  priorCategoryScores: number[];
}): Promise<AIAnalysis> {
  const fallback: AIAnalysis = {
    riskLevel:
      input.mission.answerAssessment === "PHISHING"
        ? "HIGH"
        : input.mission.answerAssessment === "SUSPICIOUS"
          ? "MEDIUM"
          : "LOW",
    score: input.score,
    correctFindings: input.correctFindings,
    missedFindings: input.missedFindings,
    explanation:
      input.correctFindings.length === 0 && input.mission.correctFindings.length === 0
        ? "This simulated message follows the expected communication process and does not ask for credentials, payment, or unusual action."
        : `Your investigation matched ${input.correctFindings.length} of ${input.mission.correctFindings.length} expected indicators. Review the sender, destination, and requested action before responding to a message like this.`,
    recommendations: [
      "Verify unusual requests through a known, independent contact method.",
      "Open important services from a saved bookmark instead of an email link.",
    ],
    nextRecommendedTopic: input.mission.category,
    encouragement:
      input.missedFindings.length > 0
        ? "Keep practicing. A second look at the sender and requested action can reveal what was missed."
        : "Good investigation. Keep applying the same verification habits.",
  };

  for (const model of GEMINI_MODELS) {
    try {
      const result = await getGemini().models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  task: "Analyze this fictional defensive cybersecurity email investigation.",
                  mission: {
                    title: input.mission.title,
                    category: input.mission.category,
                    scenario: input.mission.scenario,
                    trueAssessment: input.mission.answerAssessment,
                    expectedIndicators: input.mission.correctFindings,
                  },
                  defender: {
                    assessment: input.assessment,
                    findings: input.findings,
                    computedScore: input.score,
                    matchedFindings: input.correctFindings,
                    missedFindings: input.missedFindings,
                    recentCategoryScores: input.priorCategoryScores,
                  },
                  outputRequirements:
                    "Return one JSON object only with riskLevel, score, correctFindings, missedFindings, explanation, recommendations, nextRecommendedTopic, encouragement. Keep it defensive and educational. Never include instructions for attacks, credential theft, or exploit execution. The score and finding lists supplied by the server are authoritative.",
                }),
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            "You are CyberQuest AI, a defensive cybersecurity training coach. Explain simulated incidents in clear, practical terms. Do not provide offensive instructions. Respond only with valid JSON matching the requested fields.",
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const parsed = analysisSchema.safeParse(parseJson(result.text));
      if (!parsed.success) throw new Error("Gemini response did not match the required schema");
      return {
        ...parsed.data,
        score: input.score,
        correctFindings: input.correctFindings,
        missedFindings: input.missedFindings,
      };
    } catch (error) {
      logger.warn(
        { model, errorType: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : String(error) },
        `Gemini mission analysis attempt failed for model ${model}`,
      );
    }
  }
  return fallback;
}

export async function answerMentor(question: string): Promise<MentorAnswer> {
  const fallback: MentorAnswer = {
    answer:
      "I can help with defensive cybersecurity learning. Ask about account protection, phishing indicators, MFA, incident reporting, secure configuration, or other ways to reduce risk.",
    safetyRedirect: true,
    topic: "Defensive cybersecurity",
  };
  for (const model of GEMINI_MODELS) {
    try {
      const result = await getGemini().models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
        config: {
          systemInstruction:
            "You are CyberQuest AI, a defensive cybersecurity education mentor. Explain concepts, prevention, detection, and incident response. Refuse requests for credential theft, malware creation, unauthorized access, phishing operations, real-world exploitation, or destructive activity. Redirect those requests toward safe defense. Return valid JSON only with answer (string), safetyRedirect (boolean), and topic (short string).",
          responseMimeType: "application/json",
          temperature: 0.25,
        },
      });
      const parsed = mentorSchema.safeParse(parseJson(result.text));
      if (!parsed.success) throw new Error("Gemini mentor response did not match the required schema");
      return parsed.data;
    } catch (error) {
      logger.warn(
        { model, errorType: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : String(error) },
        `Gemini mentor attempt failed for model ${model}`,
      );
    }
  }
  return fallback;
}

const explainSchema = z.object({
  summary: z.string().min(1),
  explanation: z.string().min(1),
  keyPoints: z.array(z.string()).default([]),
  securityConsiderations: z.array(z.string()).default([]),
});

export type CodeExplanation = z.infer<typeof explainSchema>;

export async function explainCode(input: { language: string; code: string }): Promise<CodeExplanation> {
  const fallback: CodeExplanation = {
    summary: `Overview of ${input.language} code`,
    explanation: "This program sets up a basic execution flow and outputs a greeting or status message. Review variable scope and function calls to understand the flow.",
    keyPoints: ["Initializes standard runtime structure", "Executes top-level or entry-point function", "Produces expected console output"],
    securityConsiderations: ["Ensure input validation is applied to user data", "Avoid executing unchecked dynamic strings"],
  };

  for (const model of GEMINI_MODELS) {
    try {
      const result = await getGemini().models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  task: "Explain this code for a cybersecurity student.",
                  language: input.language,
                  code: input.code,
                  instructions: "Explain the code step by step. Highlight defensive coding habits and potential security implications. Return JSON only with fields: summary, explanation, keyPoints (string array), securityConsiderations (string array).",
                }),
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            "You are CyberQuest AI, an expert programming and cybersecurity coach. Explain code clearly, accurately, and educationally. Return valid JSON only.",
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const parsed = explainSchema.safeParse(parseJson(result.text));
      if (!parsed.success) throw new Error("Gemini explanation did not match schema");
      return parsed.data;
    } catch (error) {
      logger.warn(
        { model, errorType: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : String(error) },
        `Gemini explainCode attempt failed for model ${model}`,
      );
    }
  }

  return fallback;
}

const debugSchema = z.object({
  issue: z.string().min(1),
  explanation: z.string().min(1),
  fixedCode: z.string().default(""),
  preventionTips: z.array(z.string()).default([]),
});

export type CodeDebugResult = z.infer<typeof debugSchema>;

export async function debugCode(input: {
  language: string;
  code: string;
  errorOutput?: string;
}): Promise<CodeDebugResult> {
  const fallback: CodeDebugResult = {
    issue: "Potential syntax or runtime mismatch",
    explanation: input.errorOutput 
      ? `Execution indicated: ${input.errorOutput}. Check syntax, variable names, and function declarations.`
      : "No runtime error was reported, but check logic boundaries and edge conditions.",
    fixedCode: input.code,
    preventionTips: ["Verify function signatures and return types", "Check indentation and bracket matching"],
  };

  for (const model of GEMINI_MODELS) {
    try {
      const result = await getGemini().models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  task: "Debug and fix this code for a student.",
                  language: input.language,
                  code: input.code,
                  runtimeError: input.errorOutput || "None reported",
                  instructions: "Analyze the bug or potential flaws. Return valid JSON only with fields: issue (short summary), explanation (clear breakdown of root cause), fixedCode (the complete corrected code), preventionTips (array of defensive suggestions).",
                }),
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            "You are CyberQuest AI, a cybersecurity tutor and code debugger. Identify errors, explain them clearly, and provide secure corrected code. Return valid JSON only.",
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });
      const parsed = debugSchema.safeParse(parseJson(result.text));
      if (!parsed.success) throw new Error("Gemini debug did not match schema");
      return parsed.data;
    } catch (error) {
      logger.warn(
        { model, errorType: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : String(error) },
        `Gemini debugCode attempt failed for model ${model}`,
      );
    }
  }

  return fallback;
}

