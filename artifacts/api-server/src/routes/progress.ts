import { count, desc, eq, gt, gte, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetLeaderboardQueryParams,
  GetLeaderboardResponse,
  GetProgressResponse,
} from "@workspace/api-zod";
import {
  db,
  missionAttemptsTable,
  missionCompletionsTable,
  missionsTable,
  usersTable,
} from "@workspace/db";
import { errorResponse, levelForXp } from "../lib/cyberquest";
import { optionalAuth, requireAuth } from "../middlewares/cyberquest-auth";

const router: IRouter = Router();

router.get("/progress", requireAuth, async (req, res): Promise<void> => {
  const userId = req.cyberquestUser!.userId;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user) {
    errorResponse(res, 401, "UNAUTHORIZED", "Your session is no longer valid.");
    return;
  }
  const attempts = await db
    .select({
      score: missionAttemptsTable.score,
      xpAwarded: missionAttemptsTable.xpAwarded,
      createdAt: missionAttemptsTable.createdAt,
      title: missionsTable.title,
      category: missionsTable.category,
    })
    .from(missionAttemptsTable)
    .innerJoin(
      missionsTable,
      eq(missionAttemptsTable.missionId, missionsTable.id),
    )
    .where(eq(missionAttemptsTable.userId, userId))
    .orderBy(desc(missionAttemptsTable.createdAt))
    .limit(100);
  const completions = await db
    .select({ value: count() })
    .from(missionCompletionsTable)
    .where(eq(missionCompletionsTable.userId, userId));
  const rankRow = await db
    .select({ value: count() })
    .from(usersTable)
    .where(gt(usersTable.xp, user.xp));
  const categoryGroups = new Map<string, number[]>();
  for (const attempt of attempts) {
    const scores = categoryGroups.get(attempt.category) ?? [];
    scores.push(attempt.score);
    categoryGroups.set(attempt.category, scores);
  }
  const categoryScores = [...categoryGroups.entries()].map(
    ([category, scores]) => ({
      category,
      score: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
      attempts: scores.length,
    }),
  );
  const weakest = [...categoryScores].sort((left, right) => left.score - right.score)[0];
  const level = levelForXp(user.xp);
  res.json(
    GetProgressResponse.parse({
      success: true,
      data: {
        xp: user.xp,
        ...level,
        missionsCompleted: completions[0]?.value ?? 0,
        accuracy: attempts.length
          ? Math.round(
              attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
                attempts.length,
            )
          : 0,
        streak: user.streak,
        globalRank: (rankRow[0]?.value ?? 0) + 1,
        categoryScores,
        recentActivity: attempts.slice(0, 5).map((attempt) => ({
          missionTitle: attempt.title,
          category: attempt.category,
          score: attempt.score,
          xpAwarded: attempt.xpAwarded,
          createdAt: (typeof attempt.createdAt === "string" ? new Date(attempt.createdAt) : attempt.createdAt).toISOString(),
        })),
        recommendation: weakest
          ? `Your lowest recent score is ${weakest.category} (${weakest.score}%). Try another mission in this area.`
          : null,
      },
    }),
  );
});

router.get("/leaderboard", optionalAuth, async (req, res): Promise<void> => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Choose global, weekly, or monthly.");
    return;
  }
  const period = parsed.data.period ?? "global";
  let entries: Array<{
    userId: number;
    name: string;
    level: number;
    xp: number;
    missions: number;
  }> = [];

  if (period === "global") {
    const leaders = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        xp: usersTable.xp,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.xp), usersTable.createdAt)
      .limit(100);
    const completedCounts = await db
      .select({ userId: missionCompletionsTable.userId, missions: count() })
      .from(missionCompletionsTable)
      .groupBy(missionCompletionsTable.userId);
    const countsByUser = new Map(
      completedCounts.map((entry) => [entry.userId, entry.missions]),
    );
    entries = leaders.map((leader) => ({
      userId: leader.id,
      name: leader.name,
      xp: leader.xp,
      level: levelForXp(leader.xp).level,
      missions: countsByUser.get(leader.id) ?? 0,
    }));
  } else {
    const now = new Date();
    const start = new Date(now);
    if (period === "weekly") start.setUTCDate(start.getUTCDate() - 7);
    else start.setUTCDate(start.getUTCDate() - 30);
    const activity = await db
      .select({
        userId: missionAttemptsTable.userId,
        name: usersTable.name,
        xp: sql<number>`coalesce(sum(${missionAttemptsTable.xpAwarded}), 0)`,
        attempts: count(),
      })
      .from(missionAttemptsTable)
      .innerJoin(usersTable, eq(missionAttemptsTable.userId, usersTable.id))
      .where(gte(missionAttemptsTable.createdAt, start))
      .groupBy(missionAttemptsTable.userId, usersTable.name)
      .orderBy(desc(sql`coalesce(sum(${missionAttemptsTable.xpAwarded}), 0)`))
      .limit(100);
    entries = activity.map((entry) => ({
      userId: entry.userId,
      name: entry.name,
      xp: Number(entry.xp),
      level: levelForXp(Number(entry.xp)).level,
      missions: entry.attempts,
    }));
  }

  res.json(
    GetLeaderboardResponse.parse({
      success: true,
      data: {
        period,
        entries: entries.map((entry, index) => ({ rank: index + 1, ...entry })),
        currentUserId: req.cyberquestUser?.userId ?? null,
      },
    }),
  );
});

export default router;
