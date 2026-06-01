import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleComments, schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// PATCH /api/schedules/[scheduleId]/comments/[commentId]/resolve - Toggle resolve status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId, commentId } = await params;

  try {
    // Get the comment
    const [comment] = await db.select()
      .from(scheduleComments)
      .where(eq(scheduleComments.id, commentId));

    if (!comment) {
      return NextResponse.json({ error: 'Komentar tidak ditemukan' }, { status: 404 });
    }

    // Verify schedule ownership (only owner can resolve/unresolve)
    const [schedule] = await db.select()
      .from(schedules)
      .where(and(
        eq(schedules.id, scheduleId),
        eq(schedules.userId, user.id)
      ));

    if (!schedule) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Toggle resolve status
    const [updated] = await db.update(scheduleComments)
      .set({ 
        isResolved: !comment.isResolved,
        updatedAt: new Date()
      })
      .where(and(
        eq(scheduleComments.id, commentId),
        eq(scheduleComments.scheduleId, scheduleId)
      ))
      .returning();

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Comment resolve toggle error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mengubah status resolusi' }, { status: 500 });
  }
}
