import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export type EmailScenario = {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  subject: string;
  receivedAt: string;
  body: string;
  displayedUrl: string | null;
  attachment: string | null;
};

export type AIAnalysis = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  correctFindings: string[];
  missedFindings: string[];
  explanation: string;
  recommendations: string[];
  nextRecommendedTopic: string;
  encouragement: string;
};

export const usersTable = pgTable("cyberquest_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActivityDate: date("last_activity_date", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const missionsTable = pgTable("cyberquest_missions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  xpReward: integer("xp_reward").notNull(),
  scenario: jsonb("scenario").$type<EmailScenario>().notNull(),
  answerAssessment: text("answer_assessment").notNull(),
  correctFindings: text("correct_findings").array().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const missionAttemptsTable = pgTable("cyberquest_mission_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  missionId: integer("mission_id")
    .notNull()
    .references(() => missionsTable.id, { onDelete: "cascade" }),
  assessment: text("assessment").notNull(),
  findings: text("findings").array().notNull().default([]),
  score: integer("score").notNull(),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  feedback: jsonb("feedback").$type<AIAnalysis>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const missionCompletionsTable = pgTable(
  "cyberquest_mission_completions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    missionId: integer("mission_id")
      .notNull()
      .references(() => missionsTable.id, { onDelete: "cascade" }),
    bestScore: integer("best_score").notNull(),
    xpAwarded: integer("xp_awarded").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userMissionUnique: uniqueIndex("cyberquest_user_mission_unique").on(
      table.userId,
      table.missionId,
    ),
  }),
);

export const mentorInteractionsTable = pgTable(
  "cyberquest_mentor_interactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    safetyRedirect: boolean("safety_redirect").notNull().default(false),
    responseTimeMs: integer("response_time_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type Mission = typeof missionsTable.$inferSelect;
export type MissionAttempt = typeof missionAttemptsTable.$inferSelect;
