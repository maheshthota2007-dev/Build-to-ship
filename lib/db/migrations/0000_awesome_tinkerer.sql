CREATE TABLE "cyberquest_mentor_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"topic" text NOT NULL,
	"safety_redirect" boolean DEFAULT false NOT NULL,
	"response_time_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyberquest_mission_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mission_id" integer NOT NULL,
	"assessment" text NOT NULL,
	"findings" text[] DEFAULT '{}' NOT NULL,
	"score" integer NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"feedback" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyberquest_mission_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"mission_id" integer NOT NULL,
	"best_score" integer NOT NULL,
	"xp_awarded" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cyberquest_missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"xp_reward" integer NOT NULL,
	"scenario" jsonb NOT NULL,
	"answer_assessment" text NOT NULL,
	"correct_findings" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cyberquest_missions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cyberquest_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cyberquest_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cyberquest_mentor_interactions" ADD CONSTRAINT "cyberquest_mentor_interactions_user_id_cyberquest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cyberquest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyberquest_mission_attempts" ADD CONSTRAINT "cyberquest_mission_attempts_user_id_cyberquest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cyberquest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyberquest_mission_attempts" ADD CONSTRAINT "cyberquest_mission_attempts_mission_id_cyberquest_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."cyberquest_missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyberquest_mission_completions" ADD CONSTRAINT "cyberquest_mission_completions_user_id_cyberquest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cyberquest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cyberquest_mission_completions" ADD CONSTRAINT "cyberquest_mission_completions_mission_id_cyberquest_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."cyberquest_missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cyberquest_user_mission_unique" ON "cyberquest_mission_completions" USING btree ("user_id","mission_id");