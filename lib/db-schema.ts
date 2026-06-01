import { pgTable, uuid, varchar, timestamp, integer, text, time, pgEnum, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum untuk hari
export const dayEnum = pgEnum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

// Enum untuk permission level collaboration
export const permissionLevelEnum = pgEnum('permission_level', ['view', 'edit']);

// Enum untuk status collaboration
export const collaborationStatusEnum = pgEnum('collaboration_status', ['pending', 'accepted', 'rejected']);

// Enum untuk type comment
export const commentTypeEnum = pgEnum('comment_type', ['comment', 'note', 'todo']);

// Table: users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nim: varchar('nim', { length: 20 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  namaLengkap: varchar('nama_lengkap', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table: schedules
export const schedules = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  mataPelajaran: varchar('mata_pelajaran', { length: 255 }).notNull(),
  namaDosen: varchar('nama_dosen', { length: 255 }).notNull(),
  ruangan: varchar('ruangan', { length: 100 }),
  waktuMulai: time('waktu_mulai').notNull(),
  waktuSelesai: time('waktu_selesai').notNull(),
  hari: dayEnum('hari').notNull(),
  sks: integer('sks'),
  warnaKategori: varchar('warna_kategori', { length: 7 }).default('#3B82F6'),
  catatan: text('catatan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table: schedule_shares - untuk share schedule (FITUR #1)
export const scheduleShares = pgTable('schedule_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  shareToken: varchar('share_token', { length: 255 }).notNull().unique(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table: collaborations - untuk collaborative calendar (FITUR #2)
export const collaborations = pgTable('collaborations', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  collaboratorUserId: uuid('collaborator_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionLevel: permissionLevelEnum('permission_level').default('view').notNull(),
  status: collaborationStatusEnum('status').default('pending').notNull(),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table: schedule_comments - untuk comments on schedule (FITUR #3)
export const scheduleComments = pgTable('schedule_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id').references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  type: commentTypeEnum('type').default('comment').notNull(),
  isResolved: boolean('is_resolved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export schemas for validation (Zod)
export const insertUserSchema = createInsertSchema(users).pick({
  nim: true, password: true, namaLengkap: true, email: true,
}).extend({
  nim: z.string().regex(/^\d+$/, 'NIM hanya boleh berisi angka').min(8, 'NIM minimal 8 karakter'),
  password: z.string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf kapital')
    .regex(/[0-9]/, 'Harus ada angka'),
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter'),
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  mataPelajaran: true, namaDosen: true, ruangan: true, waktuMulai: true, 
  waktuSelesai: true, hari: true, sks: true, warnaKategori: true, catatan: true,
}).extend({
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format: HH:MM'),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format: HH:MM'),
}).refine((data) => data.waktuSelesai > data.waktuMulai, {
  message: 'Waktu selesai harus lebih besar dari waktu mulai',
});

// Export schemas for new tables (Zod)
export const insertScheduleShareSchema = createInsertSchema(scheduleShares).pick({
  scheduleId: true, expiresAt: true,
});

export const insertCollaborationSchema = createInsertSchema(collaborations).pick({
  collaboratorUserId: true, permissionLevel: true,
});

export const insertScheduleCommentSchema = createInsertSchema(scheduleComments).pick({
  scheduleId: true, content: true, type: true,
}).extend({
  content: z.string().min(1, 'Komentar tidak boleh kosong'),
  type: z.enum(['comment', 'note', 'todo']).default('comment'),
});