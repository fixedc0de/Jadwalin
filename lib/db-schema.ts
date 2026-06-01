import { pgTable, uuid, varchar, timestamp, integer, text, time, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enum untuk hari
export const dayEnum = pgEnum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

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