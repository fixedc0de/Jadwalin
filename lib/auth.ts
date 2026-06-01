import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// ========== PASSWORD UTILS ==========
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};

// ========== JWT UTILS ==========
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export async function createToken(payload: { id: string; nim: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; nim: string };
  } catch {
    return null;
  }
}

// ========== SESSION MANAGEMENT (Next.js 15+ async cookies) ==========
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('jadwalin_token')?.value;
  
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('jadwalin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('jadwalin_token');
}

// ========== ZOD SCHEMAS ==========
export const insertUserSchema = z.object({
  nim: z.string()
    .regex(/^\d+$/, 'NIM hanya boleh berisi angka')
    .min(8, 'NIM minimal 8 karakter'),
  password: z.string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf kapital')
    .regex(/[0-9]/, 'Harus ada angka'),
  namaLengkap: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

export const insertScheduleSchema = z.object({
  mataPelajaran: z.string().min(2, 'Mata pelajaran wajib diisi'),
  namaDosen: z.string().min(2, 'Nama dosen wajib diisi'),
  ruangan: z.string().optional(),
  waktuMulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format: HH:MM'),
  waktuSelesai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format: HH:MM'),
  hari: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']),
  sks: z.number().int().min(1).max(6).optional().or(z.null()),
  warnaKategori: z.string().regex(/^#[0-9A-F]{6}$/i, 'Format: #RRGGBB').default('#3B82F6'),
  catatan: z.string().optional(),
}).refine((data) => data.waktuSelesai > data.waktuMulai, {
  message: 'Waktu selesai harus lebih besar dari waktu mulai',
  path: ['waktuSelesai'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf kapital')
    .regex(/[0-9]/, 'Harus ada angka'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru tidak cocok',
  path: ['confirmPassword'],
});