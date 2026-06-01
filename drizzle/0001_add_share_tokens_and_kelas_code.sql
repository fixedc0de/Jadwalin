-- Migration 0001: Add share_tokens table and kelas_code field
-- Fitur: Share Jadwal (Read-Only Link) & Kelas/Kelompok View

-- Tambah kolom kelas_code di tabel users
ALTER TABLE "users" ADD COLUMN "kelas_code" varchar(50);--> statement-breakpoint

-- Buat index untuk performa query kelas
CREATE INDEX IF NOT EXISTS "idx_users_kelas_code" ON "users" ("kelas_code");--> statement-breakpoint

-- Buat tabel share_tokens untuk fitur sharing jadwal
CREATE TABLE "share_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "share_tokens_token_hash_unique" UNIQUE("token_hash")
);--> statement-breakpoint

-- Buat index untuk performa dan lookup token
CREATE INDEX IF NOT EXISTS "idx_share_tokens_token_hash" ON "share_tokens" ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_share_tokens_user_id" ON "share_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_share_tokens_expires_at" ON "share_tokens" ("expires_at");--> statement-breakpoint

-- Tambah foreign key constraint
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
