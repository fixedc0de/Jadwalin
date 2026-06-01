import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleComments, schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// PATCH /api/schedules/[scheduleId]/comments/[commentId] - Edit comment
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

    // Only author can edit
    if (comment.userId !== user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat mengedit komentar ini' }, { status: 403 });
    }

    const body = await req.json();
    const { content } = body as { content?: string };

    if (content !== undefined && content.trim().length === 0) {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (content !== undefined) updateData.content = content.trim();

    const [updated] = await db.update(scheduleComments)
      .set(updateData)
      .where(and(
        eq(scheduleComments.id, commentId),
        eq(scheduleComments.scheduleId, scheduleId)
      ))
      .returning();

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Comment update error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui komentar' }, { status: 500 });
  }
}

// DELETE /api/schedules/[scheduleId]/comments/[commentId] - Delete comment
export async function DELETE(
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

    // Check if user is comment author or schedule owner
    const [schedule] = await db.select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    if (comment.userId !== user.id && schedule.userId !== user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus komentar ini' }, { status: 403 });
    }

    await db.delete(scheduleComments)
      .where(and(
        eq(scheduleComments.id, commentId),
        eq(scheduleComments.scheduleId, scheduleId)
      ));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Comment delete error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus komentar' }, { status: 500 });
  }
}
