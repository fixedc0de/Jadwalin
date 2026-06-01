CREATE TYPE "public"."permission_level" AS ENUM('view', 'edit');--> statement-breakpoint
CREATE TYPE "public"."collaboration_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."comment_type" AS ENUM('comment', 'note', 'todo');--> statement-breakpoint
CREATE TABLE "schedule_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"share_token" varchar(255) NOT NULL,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"collaborator_user_id" uuid NOT NULL,
	"permission_level" "permission_level" DEFAULT 'view' NOT NULL,
	"status" "collaboration_status" DEFAULT 'pending' NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" "comment_type" DEFAULT 'comment' NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule_shares" ADD CONSTRAINT "schedule_shares_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_shares" ADD CONSTRAINT "schedule_shares_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_collaborator_user_id_users_id_fk" FOREIGN KEY ("collaborator_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_comments" ADD CONSTRAINT "schedule_comments_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_comments" ADD CONSTRAINT "schedule_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_shares_share_token_unique_idx" ON "schedule_shares" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "schedule_shares_schedule_id_idx" ON "schedule_shares" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "collaborations_owner_user_id_idx" ON "collaborations" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "collaborations_collaborator_user_id_idx" ON "collaborations" USING btree ("collaborator_user_id");--> statement-breakpoint
CREATE INDEX "schedule_comments_schedule_id_idx" ON "schedule_comments" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "schedule_comments_user_id_idx" ON "schedule_comments" USING btree ("user_id");
