import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { insertUserSchema, hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const valid = insertUserSchema.parse(body);
    
    // Check if NIM already exists
    const existing = await db.select().from(users).where(eq(users.nim, valid.nim));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'NIM sudah terdaftar' }, { status: 400 });
    }

    // Hash password & create user
    const hashedPassword = await hashPassword(valid.password);
    await db.insert(users).values({
      nim: valid.nim,
      password: hashedPassword,
      namaLengkap: valid.namaLengkap,
      email: valid.email || null,
    });

    return NextResponse.json({ success: true, message: 'Registrasi berhasil' });
  } catch (err: any) {
    if (err.issues) {
      return NextResponse.json({ 
        error: err.issues.map((i: any) => i.message).join(', ') 
      }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}