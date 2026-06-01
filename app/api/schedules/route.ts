import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { insertScheduleSchema } from '@/lib/db-schema';

// GET all schedules for authenticated user
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const data = await db.select().from(schedules).where(eq(schedules.userId, user.id));
  return NextResponse.json(data);
}

// POST create new schedule
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const valid = insertScheduleSchema.parse(body);

    // Conflict detection: check for overlapping schedules on same day
    const existing = await db.select().from(schedules)
      .where(and(eq(schedules.userId, user.id), eq(schedules.hari, valid.hari)));
    
    const hasOverlap = existing.some(s => 
      new Date(`2000-01-01T${valid.waktuMulai}`) < new Date(`2000-01-01T${s.waktuSelesai}`) &&
      new Date(`2000-01-01T${valid.waktuSelesai}`) > new Date(`2000-01-01T${s.waktuMulai}`)
    );
    
    if (hasOverlap) {
      return NextResponse.json({ error: 'Jadwal bentrok dengan jadwal lain!' }, { status: 409 });
    }

    await db.insert(schedules).values({ ...valid, userId: user.id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.issues) {
      return NextResponse.json({ error: err.issues.map((i: any) => i.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Validation failed' }, { status: 400 });
  }
}