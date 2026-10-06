import { Router, type IRouter } from "express";
import { AskCyberMentorBody, AskCyberMentorResponse } from "@workspace/api-zod";
import { db, mentorInteractionsTable } from "@workspace/db";
import { answerMentor } from "../lib/ai";
import { errorResponse } from "../lib/cyberquest";
import { requireAuth } from "../middlewares/cyberquest-auth";

const router: IRouter = Router();
const requestTimes = new Map<number, number[]>();

router.post("/ai/mentor", requireAuth, async (req, res): Promise<void> => {
  const parsed = AskCyberMentorBody.safeParse(req.body);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Ask a question between 3 and 1,000 characters.");
    return;
  }
  const userId = req.cyberquestUser!.userId;
  const now = Date.now();
  const recent = (requestTimes.get(userId) ?? []).filter(
    (timestamp) => now - timestamp < 60_000,
  );
  if (recent.length >= 8) {
    errorResponse(res, 429, "RATE_LIMITED", "Please wait before asking another question.");
    return;
  }
  recent.push(now);
  requestTimes.set(userId, recent);
  const startedAt = Date.now();
  const answer = await answerMentor(parsed.data.question.trim());
  await db.insert(mentorInteractionsTable).values({
    userId,
    topic: answer.topic.slice(0, 80),
    safetyRedirect: answer.safetyRedirect,
    responseTimeMs: Date.now() - startedAt,
  });
  res.json(
    AskCyberMentorResponse.parse({
      success: true,
      data: answer,
    }),
  );
});

export default router;
