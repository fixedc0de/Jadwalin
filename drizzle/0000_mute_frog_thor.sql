CREATE TYPE "public"."day" AS ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu');--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mata_pelajaran" varchar(255) NOT NULL,
	"nama_dosen" varchar(255) NOT NULL,
	"ruangan" varchar(100),
	"waktu_mulai" time NOT NULL,
	"waktu_selesai" time NOT NULL,
	"hari" "day" NOT NULL,
	"sks" integer,
	"warna_kategori" varchar(7) DEFAULT '#3B82F6',
	"catatan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nim" varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255),
	"nama_lengkap" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_nim_unique" UNIQUE("nim")
);
--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;