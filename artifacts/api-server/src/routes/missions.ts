import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ArchiveMissionParams,
  ArchiveMissionResponse,
  CreateMissionBody,
  CreateMissionResponse,
  GetMissionParams,
  GetMissionResponse,
  ListAdminMissionsResponse,
  ListMissionsQueryParams,
  ListMissionsResponse,
  SubmitMissionAttemptBody,
  SubmitMissionAttemptParams,
  SubmitMissionAttemptResponse,
  UpdateMissionBody,
  UpdateMissionParams,
  UpdateMissionResponse,
} from "@workspace/api-zod";
import {
  db,
  missionAttemptsTable,
  missionCompletionsTable,
  missionsTable,
  usersTable,
} from "@workspace/db";
import { analyzeMission } from "../lib/ai";
import {
  ensureSeedMissions,
  errorResponse,
  findingOptions,
  isMissionCompleted,
  toAdminMission,
  toPublicMission,
} from "../lib/cyberquest";
import { optionalAuth, requireAdmin, requireAuth } from "../middlewares/cyberquest-auth";

const router: IRouter = Router();

router.get("/missions", optionalAuth, async (req, res): Promise<void> => {
  await ensureSeedMissions();
  const parsed = ListMissionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Invalid mission search filters.");
    return;
  }
  const filters = [eq(missionsTable.active, true)];
  const { search, category, difficulty, sort } = parsed.data;
  if (category) filters.push(eq(missionsTable.category, category));
  if (difficulty) filters.push(eq(missionsTable.difficulty, difficulty));
  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    const textMatch = or(
      ilike(missionsTable.title, pattern),
      ilike(missionsTable.description, pattern),
      ilike(missionsTable.category, pattern),
    );
    if (textMatch) filters.push(textMatch);
  }
  const rows = await db
    .select()
    .from(missionsTable)
    .where(and(...filters))
    .orderBy(
      sort === "title"
        ? asc(missionsTable.title)
        : sort === "reward"
          ? desc(missionsTable.xpReward)
          : asc(missionsTable.id),
    );
  const userId = req.cyberquestUser?.userId;
  const completedIds = userId
    ? rows.length
      ? await db
          .select({ missionId: missionCompletionsTable.missionId })
          .from(missionCompletionsTable)
          .where(
            and(
              eq(missionCompletionsTable.userId, userId),
              inArray(
                missionCompletionsTable.missionId,
                rows.map((mission) => mission.id),
              ),
            ),
          )
          .then((completed) => new Set(completed.map((item) => item.missionId)))
      : new Set<number>()
    : new Set<number>();
  const missions = rows.map((mission) =>
    toPublicMission(mission, completedIds.has(mission.id)),
  );
  res.json(
    ListMissionsResponse.parse({
      success: true,
      data: { missions },
    }),
  );
});

router.get("/missions/:id", optionalAuth, async (req, res): Promise<void> => {
  await ensureSeedMissions();
  const params = GetMissionParams.safeParse(req.params);
  if (!params.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Invalid mission ID.");
    return;
  }
  const [mission] = await db
    .select()
    .from(missionsTable)
    .where(and(eq(missionsTable.id, params.data.id), eq(missionsTable.active, true)))
    .limit(1);
  if (!mission) {
    errorResponse(res, 404, "MISSION_NOT_FOUND", "Mission not found.");
    return;
  }
  const completed = req.cyberquestUser
    ? await isMissionCompleted(req.cyberquestUser.userId, mission.id)
    : false;
  res.json(
    GetMissionResponse.parse({
      success: true,
      data: { mission: toPublicMission(mission, completed) },
    }),
  );
});

router.post(
  "/missions/:id/attempt",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = SubmitMissionAttemptParams.safeParse(req.params);
    const parsed = SubmitMissionAttemptBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      errorResponse(res, 400, "VALIDATION_ERROR", "Check the mission ID, assessment, and findings.");
      return;
    }
    if (
      parsed.data.findings.some(
        (finding) => !findingOptions.includes(finding as (typeof findingOptions)[number]),
      )
    ) {
      errorResponse(res, 400, "INVALID_FINDING", "Choose findings from the investigation checklist.");
      return;
    }
    await ensureSeedMissions();
    const [mission] = await db
      .select()
      .from(missionsTable)
      .where(and(eq(missionsTable.id, params.data.id), eq(missionsTable.active, true)))
      .limit(1);
    if (!mission) {
      errorResponse(res, 404, "MISSION_NOT_FOUND", "Mission not found.");
      return;
    }

    const chosen = [...new Set(parsed.data.findings)];
    const correctFindings = mission.correctFindings.filter((finding) =>
      chosen.includes(finding),
    );
    const missedFindings = mission.correctFindings.filter(
      (finding) => !chosen.includes(finding),
    );
    const findingRatio = mission.correctFindings.length
      ? correctFindings.length / mission.correctFindings.length
      : chosen.length === 0
        ? 1
        : 0;
    const score = Math.min(
      100,
      Math.round(findingRatio * 80) +
        (parsed.data.assessment === mission.answerAssessment ? 20 : 0),
    );

    const priorAttempts = await db
      .select({ score: missionAttemptsTable.score })
      .from(missionAttemptsTable)
      .innerJoin(
        missionsTable,
        eq(missionAttemptsTable.missionId, missionsTable.id),
      )
      .where(
        and(
          eq(missionAttemptsTable.userId, req.cyberquestUser!.userId),
          eq(missionsTable.category, mission.category),
        ),
      )
      .orderBy(desc(missionAttemptsTable.createdAt))
      .limit(20);

    const feedback = await analyzeMission({
      mission,
      assessment: parsed.data.assessment,
      findings: chosen,
      score,
      correctFindings,
      missedFindings,
      priorCategoryScores: priorAttempts.map((attempt) => attempt.score),
    });
    const completedAt = new Date();
    const today = completedAt.toISOString().slice(0, 10);
    const yesterday = new Date(completedAt.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const saved = await db.transaction(async (tx) => {
      const proposedXp = Math.round((mission.xpReward * score) / 100);
      const [newCompletion] = await tx
        .insert(missionCompletionsTable)
        .values({
          userId: req.cyberquestUser!.userId,
          missionId: mission.id,
          bestScore: score,
          xpAwarded: proposedXp,
        })
        .onConflictDoNothing({
          target: [
            missionCompletionsTable.userId,
            missionCompletionsTable.missionId,
          ],
        })
        .returning({ id: missionCompletionsTable.id });
      const xpAwarded = newCompletion ? proposedXp : 0;

      if (!newCompletion) {
        await tx
          .update(missionCompletionsTable)
          .set({
            bestScore: sql`greatest(${missionCompletionsTable.bestScore}, ${score})`,
          })
          .where(
            and(
              eq(missionCompletionsTable.userId, req.cyberquestUser!.userId),
              eq(missionCompletionsTable.missionId, mission.id),
            ),
          );
      }

      const [user] = await tx
        .select({
          streak: usersTable.streak,
          lastActivityDate: usersTable.lastActivityDate,
        })
        .from(usersTable)
        .where(eq(usersTable.id, req.cyberquestUser!.userId))
        .limit(1);
      const streak =
        user?.lastActivityDate === today
          ? user.streak
          : user?.lastActivityDate === yesterday
            ? user.streak + 1
            : 1;
      await tx
        .update(usersTable)
        .set({
          xp: sql`${usersTable.xp} + ${xpAwarded}`,
          streak,
          lastActivityDate: today,
        })
        .where(eq(usersTable.id, req.cyberquestUser!.userId));
      const [attempt] = await tx
        .insert(missionAttemptsTable)
        .values({
          userId: req.cyberquestUser!.userId,
          missionId: mission.id,
          assessment: parsed.data.assessment,
          findings: chosen,
          score,
          xpAwarded,
          feedback,
        })
        .returning();
      return { attempt, xpAwarded };
    });

    if (!saved.attempt) {
      errorResponse(res, 500, "ATTEMPT_SAVE_FAILED", "Unable to save your investigation.");
      return;
    }
    res.status(201).json(
      SubmitMissionAttemptResponse.parse({
        success: true,
        data: {
          attempt: {
            id: saved.attempt.id,
            missionId: saved.attempt.missionId,
            assessment: saved.attempt.assessment,
            findings: saved.attempt.findings,
            score: saved.attempt.score,
            createdAt: (typeof saved.attempt.createdAt === "string" ? new Date(saved.attempt.createdAt) : saved.attempt.createdAt).toISOString(),
          },
          feedback,
          xpAwarded: saved.xpAwarded,
          completed: true,
          nextRecommendedTopic: feedback.nextRecommendedTopic,
        },
      }),
    );
  },
);

router.get(
  "/admin/missions",
  requireAuth,
  requireAdmin,
  async (_req, res): Promise<void> => {
    await ensureSeedMissions();
    const rows = await db
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.active, true))
      .orderBy(asc(missionsTable.id));
    res.json(
      ListAdminMissionsResponse.parse({
        success: true,
        data: { missions: rows.map(toAdminMission) },
      }),
    );
  },
);

router.post(
  "/admin/missions",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = CreateMissionBody.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 400, "VALIDATION_ERROR", "Check the mission details and answer key.");
      return;
    }
    if (parsed.data.correctFindings.some((finding) => !findingOptions.includes(finding as (typeof findingOptions)[number]))) {
      errorResponse(res, 400, "INVALID_FINDING", "Choose answer-key findings from the checklist.");
      return;
    }
    const [mission] = await db
      .insert(missionsTable)
      .values({
        ...parsed.data,
        slug: `${parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60)}-${randomUUID().slice(0, 8)}`,
        active: true,
      })
      .returning();
    if (!mission) {
      errorResponse(res, 500, "MISSION_CREATE_FAILED", "Unable to create this mission.");
      return;
    }
    res.status(201).json(
      CreateMissionResponse.parse({
        success: true,
        data: { mission: toAdminMission(mission) },
      }),
    );
  },
);

router.put(
  "/admin/missions/:id",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = UpdateMissionParams.safeParse(req.params);
    const parsed = UpdateMissionBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      errorResponse(res, 400, "VALIDATION_ERROR", "Check the mission ID and details.");
      return;
    }
    if (parsed.data.correctFindings.some((finding) => !findingOptions.includes(finding as (typeof findingOptions)[number]))) {
      errorResponse(res, 400, "INVALID_FINDING", "Choose answer-key findings from the checklist.");
      return;
    }
    const [mission] = await db
      .update(missionsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(missionsTable.id, params.data.id), eq(missionsTable.active, true)))
      .returning();
    if (!mission) {
      errorResponse(res, 404, "MISSION_NOT_FOUND", "Mission not found.");
      return;
    }
    res.json(
      UpdateMissionResponse.parse({
        success: true,
        data: { mission: toAdminMission(mission) },
      }),
    );
  },
);

router.delete(
  "/admin/missions/:id",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const params = ArchiveMissionParams.safeParse(req.params);
    if (!params.success) {
      errorResponse(res, 400, "VALIDATION_ERROR", "Invalid mission ID.");
      return;
    }
    const [mission] = await db
      .update(missionsTable)
      .set({ active: false, updatedAt: new Date() })
      .where(and(eq(missionsTable.id, params.data.id), eq(missionsTable.active, true)))
      .returning({ id: missionsTable.id });
    if (!mission) {
      errorResponse(res, 404, "MISSION_NOT_FOUND", "Mission not found.");
      return;
    }
    res.json(ArchiveMissionResponse.parse({ success: true, data: {} }));
  },
);

export default router;
