import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { nim, password } = await req.json();
    
    if (!nim || !password) {
      return NextResponse.json({ error: 'NIM dan password wajib diisi' }, { status: 400 });
    }

    // Find user by NIM
    const [user] = await db.select().from(users).where(eq(users.nim, nim));
    
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'NIM atau password salah' }, { status: 401 });
    }

    // Create JWT token & set cookie
    const token = await createToken({ id: user.id, nim: user.nim });
    await setSessionCookie(token);

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, nim: user.nim, namaLengkap: user.namaLengkap } 
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}