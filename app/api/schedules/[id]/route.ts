import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { insertScheduleSchema } from '@/lib/db-schema';

// GET single schedule
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const [schedule] = await db.select()
    .from(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)));
  
  if (!schedule) {
    return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
  }
  
  return NextResponse.json(schedule);
}

// PATCH update schedule
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  try {
    const body = await req.json();
    const valid = insertScheduleSchema.partial().parse(body);

    // Conflict detection for updates
    if (valid.hari || valid.waktuMulai || valid.waktuSelesai) {
      const existing = await db.select().from(schedules)
        .where(and(
          eq(schedules.userId, user.id),
          eq(schedules.hari, valid.hari || 'Senin'),
          eq(schedules.id, id) // exclude current
        ));
      
      const newStart = valid.waktuMulai || '00:00';
      const newEnd = valid.waktuSelesai || '23:59';
      
      const hasOverlap = existing.some(s => 
        new Date(`2000-01-01T${newStart}`) < new Date(`2000-01-01T${s.waktuSelesai}`) &&
        new Date(`2000-01-01T${newEnd}`) > new Date(`2000-01-01T${s.waktuMulai}`)
      );
      
      if (hasOverlap) {
        return NextResponse.json({ error: 'Jadwal bentrok dengan jadwal lain!' }, { status: 409 });
      }
    }

    const updated = await db.update(schedules)
      .set({ ...valid, updatedAt: new Date() })
      .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)))
      .returning();
    
    if (!updated.length) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(updated[0]);
  } catch (err: any) {
    if (err.issues) {
      return NextResponse.json({ error: err.issues.map((i: any) => i.message).join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Gagal memperbarui jadwal' }, { status: 500 });
  }
}

// DELETE schedule
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const deleted = await db.delete(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)))
    .returning();
  
  if (!deleted.length) {
    return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}