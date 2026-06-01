import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { getSession, verifyPassword, hashPassword, changePasswordSchema } from '@/lib/auth';

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const valid = changePasswordSchema.parse(body);

    // Get user with password
    const [user] = await db.select().from(users).where(eq(users.id, session.id));
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify current password
    if (!(await verifyPassword(valid.currentPassword, user.password))) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
    }

    // Update password
    const hashedPassword = await hashPassword(valid.newPassword);
    await db.update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, session.id));

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err: any) {
    if (err.issues) {
      return NextResponse.json({ error: err.issues.map((i: any) => i.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}