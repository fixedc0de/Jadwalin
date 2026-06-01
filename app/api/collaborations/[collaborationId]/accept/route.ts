import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collaborations } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// PATCH /api/collaborations/[collaborationId]/accept - Accept invite
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collaborationId: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collaborationId } = await params;

  try {
    // Get the collaboration
    const [collab] = await db.select()
      .from(collaborations)
      .where(eq(collaborations.id, collaborationId));

    if (!collab) {
      return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 });
    }

    // Only the invited collaborator can accept
    if (collab.collaboratorUserId !== user.id) {
      return NextResponse.json({ error: 'Anda bukan penerima undangan ini' }, { status: 403 });
    }

    // Check if already responded
    if (collab.status !== 'pending') {
      return NextResponse.json({ error: 'Undangan ini sudah direspons' }, { status: 400 });
    }

    // Accept the invitation
    const [updated] = await db.update(collaborations)
      .set({ 
        status: 'accepted',
        respondedAt: new Date(),
      })
      .where(eq(collaborations.id, collaborationId))
      .returning();

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      respondedAt: updated.respondedAt,
    });
  } catch (err: any) {
    console.error('Accept collaboration error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menerima undangan' }, { status: 500 });
  }
}
