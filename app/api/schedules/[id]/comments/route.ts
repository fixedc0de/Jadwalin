import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleComments, schedules, collaborations, users as usersTable } from '@/lib/db-schema';
import { eq, and, or, inArray, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// Helper to check if user has access to schedule (owner or collaborator)
async function hasScheduleAccess(userId: string, scheduleId: string): Promise<boolean> {
  const [result] = await db.select({
    scheduleUserId: schedules.userId,
    collabStatus: collaborations.status,
  })
    .from(schedules)
    .leftJoin(collaborations, and(
      eq(collaborations.ownerUserId, schedules.userId),
      eq(collaborations.collaboratorUserId, userId)
    ))
    .where(eq(schedules.id, scheduleId));

  if (!result) return false;

  return result.scheduleUserId === userId || result.collabStatus === 'accepted';
}

// POST /api/schedules/[id]/comments - Add comment
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId } = await params;

  try {
    // Verify schedule exists
    const [schedule] = await db.select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = schedule.userId === user.id;
    
    if (!isOwner) {
      const [collab] = await db.select()
        .from(collaborations)
        .where(
          and(
            eq(collaborations.ownerUserId, schedule.userId),
            eq(collaborations.collaboratorUserId, user.id),
            eq(collaborations.status, 'accepted')
          )
        );

      if (!collab) {
        return NextResponse.json({ error: 'Anda tidak memiliki akses ke jadwal ini' }, { status: 403 });
      }
    }

    const body = await req.json();
    const { content, type = 'comment' } = body as { content: string; type?: 'comment' | 'note' | 'todo' };

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 });
    }

    const [newComment] = await db.insert(scheduleComments)
      .values({
        scheduleId,
        userId: user.id,
        content: content.trim(),
        type,
        isResolved: false,
      })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    console.error('Comment creation error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menambahkan komentar' }, { status: 500 });
  }
}

// GET /api/schedules/[id]/comments - Get all comments
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId } = await params;

  try {
    // Verify schedule exists
    const [schedule] = await db.select()
      .from(schedules)
      .where(eq(schedules.id, scheduleId));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = schedule.userId === user.id;
    
    if (!isOwner) {
      const [collab] = await db.select()
        .from(collaborations)
        .where(
          and(
            eq(collaborations.ownerUserId, schedule.userId),
            eq(collaborations.collaboratorUserId, user.id),
            eq(collaborations.status, 'accepted')
          )
        );

      if (!collab) {
        return NextResponse.json({ error: 'Anda tidak memiliki akses ke jadwal ini' }, { status: 403 });
      }
    }

    // Get comments with user info
    const comments = await db.select({
      id: scheduleComments.id,
      content: scheduleComments.content,
      type: scheduleComments.type,
      isResolved: scheduleComments.isResolved,
      createdAt: scheduleComments.createdAt,
      updatedAt: scheduleComments.updatedAt,
      authorName: usersTable.namaLengkap,
      authorId: scheduleComments.userId,
    })
      .from(scheduleComments)
      .leftJoin(usersTable, eq(scheduleComments.userId, usersTable.id))
      .where(eq(scheduleComments.scheduleId, scheduleId))
      .orderBy(desc(scheduleComments.createdAt));

    return NextResponse.json(comments);
  } catch (err: any) {
    console.error('Comment fetch error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memuat komentar' }, { status: 500 });
  }
}
