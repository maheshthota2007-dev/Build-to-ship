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

export const codingChallengesTable = pgTable("cyberquest_coding_challenges", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull(),
  problemStatement: text("problem_statement").notNull(),
  inputFormat: text("input_format").notNull(),
  outputFormat: text("output_format").notNull(),
  constraints: text("constraints").notNull(),
  starterCode: jsonb("starter_code").notNull().$type<Record<string, string>>(),
  testCases: jsonb("test_cases").notNull().$type<Array<{ input: string; expected: string }>>(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const savedCodeTable = pgTable("cyberquest_saved_code", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").references(() => codingChallengesTable.id, { onDelete: "set null" }),
  language: text("language").notNull(),
  sourceCode: text("source_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const codingSubmissionsTable = pgTable("cyberquest_coding_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  challengeId: integer("challenge_id").notNull().references(() => codingChallengesTable.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  sourceCode: text("source_code").notNull(),
  passed: boolean("passed").notNull(),
  score: integer("score").notNull(),
  xpAwarded: integer("xp_awarded").notNull().default(0),
  executionTimeMs: integer("execution_time_ms"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const learningProgressTable = pgTable("cyberquest_learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  itemId: text("item_id").notNull(),
  itemType: text("item_type").notNull(),
  status: text("status").notNull(), 
  score: integer("score").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userItemUnique: uniqueIndex("cyberquest_user_item_unique").on(table.userId, table.itemId, table.itemType),
}));

export const eventsTable = pgTable("cyberquest_events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'LAB', 'CTF', 'WORKSHOP', 'WEBINAR', 'CHALLENGE', 'HACKATHON', 'DRILL', 'THREAT_HUNT', 'COMMUNITY', 'CAREER'
  category: text("category").notNull().default("Cybersecurity"),
  status: text("status").notNull().default("PUBLISHED"), // 'PUBLISHED', 'DRAFT', 'CANCELLED'
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  locationType: text("location_type").notNull().default("online"), // 'online', 'hybrid', 'in-person'
  location: text("location").notNull().default("Online / CyberQuest Range"),
  meetingUrl: text("meeting_url"),
  difficulty: text("difficulty").notNull().default("All Levels"), // 'Beginner', 'Intermediate', 'Advanced', 'All Levels'
  capacity: integer("capacity").notNull().default(100),
  registeredCount: integer("registered_count").notNull().default(0),
  instructor: text("instructor").notNull().default("CyberQuest Academy"),
  instructorRole: text("instructor_role"),
  skills: text("skills").array().notNull().default([]),
  requirements: text("requirements").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  registrationDeadline: timestamp("registration_deadline", { withTimezone: true }),
  image: text("image"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const eventRegistrationsTable = pgTable("cyberquest_event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  reminderPreference: text("reminder_preference").notNull().default("1h"), // '15m', '1h', '1d', 'none'
  status: text("status").notNull().default("REGISTERED"), // 'REGISTERED', 'CANCELLED'
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userEventUnique: uniqueIndex("cyberquest_user_event_unique").on(table.userId, table.eventId),
}));

export type Event = typeof eventsTable.$inferSelect;
export type EventRegistration = typeof eventRegistrationsTable.$inferSelect;

export const coursesTable = pgTable("cyberquest_courses", {
  id: text("id").primaryKey(), // 'python', 'cpp', 'javascript', 'java', 'sql', 'c', 'cybersecurity'
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Programming"),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().default("Beginner"),
  totalLessons: integer("total_lessons").notNull().default(10),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonsTable = pgTable("cyberquest_lessons", {
  id: serial("id").primaryKey(),
  courseId: text("course_id").notNull(),
  slug: text("slug").notNull().unique(), // e.g. 'python-01-intro', 'python-02-variables'
  order: integer("order").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull().default(20), // minutes
  type: text("type").notNull().default("Hands-on Lab"), // 'Basics', 'Hands-on Lab', 'Core Concepts', etc.
  objectives: text("objectives").array().notNull().default([]),
  content: text("content").notNull(),
  starterCode: text("starter_code"),
  solutionCode: text("solution_code"),
  xpReward: integer("xp_reward").notNull().default(50),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  courseOrderUnique: uniqueIndex("cyberquest_course_lesson_order_unique").on(table.courseId, table.order),
}));

export type Course = typeof coursesTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;

