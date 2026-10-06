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

  try {
    const result = await getGemini().models.generateContent({
      model: "gemini-2.5-flash",
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
      { errorType: error instanceof Error ? error.name : "unknown" },
      "Gemini mission analysis unavailable; using safe feedback",
    );
    return fallback;
  }
}

export async function answerMentor(question: string): Promise<MentorAnswer> {
  const fallback: MentorAnswer = {
    answer:
      "I can help with defensive cybersecurity learning. Ask about account protection, phishing indicators, MFA, incident reporting, secure configuration, or other ways to reduce risk.",
    safetyRedirect: true,
    topic: "Defensive cybersecurity",
  };
  try {
    const result = await getGemini().models.generateContent({
      model: "gemini-2.5-flash",
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
      { errorType: error instanceof Error ? error.name : "unknown" },
      "Gemini mentor unavailable; using safe fallback",
    );
    return fallback;
  }
}
