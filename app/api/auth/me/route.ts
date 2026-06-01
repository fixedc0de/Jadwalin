import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user] = await db.select({
    id: users.id,
    nim: users.nim,
    namaLengkap: users.namaLengkap,
    email: users.email,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.id, session.id));

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user);
}